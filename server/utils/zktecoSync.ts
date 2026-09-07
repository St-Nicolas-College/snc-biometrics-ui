//@ts-ignore
import ZKLib from "node-zklib";
import dotenv from "dotenv";

import { query } from "./db";
import { syncZktecoUsers, type ZKTecoUser } from "./zkTecoUserSync";

import { broadcastNewLog } from "../api/attendance/stream.get";

dotenv.config();

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const deviceIP = process.env.ZKTECO_IP ?? "";

const devicePort = Number(process.env.ZKTECO_PORT ?? 4370);

// Poll every 60 seconds
const pollingInterval = 60 * 1000;

// Insert 500 attendance records
// per PostgreSQL query
const batchSize = 500;

if (!deviceIP) {
  throw new Error("ZKTECO_IP is missing from .env");
}

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

let syncRunning = false;

let serviceStarted = false;

let timer: NodeJS.Timeout | null = null;

let activeZk: any = null;

/*
 * During the first synchronization we may
 * insert 66,000+ historical punches.
 *
 * We don't want to broadcast all of them
 * to the frontend.
 */
let initialAttendanceSyncCompleted = false;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface RawAttendanceLog {
  userSn: number | string;

  deviceUserId: number | string;

  recordTime: Date | string;

  ip?: string;
}

interface NormalizedAttendanceLog {
  deviceUid: number;
  userId: number;
  recordTime: Date | string;
}

/*
|--------------------------------------------------------------------------
| Normalize Attendance
|--------------------------------------------------------------------------
*/

function normalizeAttendanceLogs(
  attendance: RawAttendanceLog[],
): NormalizedAttendanceLog[] {
  const validLogs: NormalizedAttendanceLog[] = [];

  let invalidCount = 0;

  for (const log of attendance) {
    const deviceUid = Number(log.userSn);

    const userId = Number(log.deviceUserId);

    if (Number.isNaN(deviceUid) || Number.isNaN(userId) || !log.recordTime) {
      invalidCount++;

      console.warn("Invalid attendance record:", log);

      continue;
    }

    validLogs.push({
      deviceUid,
      userId,
      recordTime: log.recordTime,
    });
  }

  if (invalidCount > 0) {
    console.warn(`Skipped ${invalidCount} invalid attendance records.`);
  }

  return validLogs;
}

/*
|--------------------------------------------------------------------------
| Batch Insert
|--------------------------------------------------------------------------
*/

async function insertAttendanceBatch(logs: NormalizedAttendanceLog[]) {
  if (logs.length === 0) {
    return [];
  }

  const values: any[] = [];

  const placeholders: string[] = [];

  for (let index = 0; index < logs.length; index++) {
    const log = logs[index];

    const parameterStart = index * 3;

    values.push(log.deviceUid, log.userId, log.recordTime);

    placeholders.push(`
      (
        $${parameterStart + 1},
        $${parameterStart + 2},
        $${parameterStart + 3},
        CURRENT_TIMESTAMP
      )
    `);
  }

  const sql = `
    INSERT INTO public.attendance_logs (
      device_uid,
      user_id,
      "timestamp",
      created_at
    )

    VALUES
      ${placeholders.join(",")}

    ON CONFLICT (
      device_uid,
      user_id,
      "timestamp"
    )

    DO NOTHING

    RETURNING
      id,
      device_uid,
      user_id,
      "timestamp",
      created_at
  `;

  return await query(sql, values);
}

/*
|--------------------------------------------------------------------------
| Attendance Database Synchronization
|--------------------------------------------------------------------------
*/

async function syncAttendance(attendance: RawAttendanceLog[]) {
  console.log("");
  console.log("=================================");
  console.log("Starting Attendance DB Sync");
  console.log("=================================");

  console.log(`Attendance received: ${attendance.length}`);

  const validLogs = normalizeAttendanceLogs(attendance);

  console.log(`Valid attendance: ${validLogs.length}`);

  let processed = 0;

  let totalInserted = 0;

  let totalExisting = 0;

  /*
  |--------------------------------------------------------------------------
  | Process in batches
  |--------------------------------------------------------------------------
  */

  for (let start = 0; start < validLogs.length; start += batchSize) {
    const batch = validLogs.slice(start, start + batchSize);

    try {
      const inserted = await insertAttendanceBatch(batch);

      const insertedCount = inserted.length;

      const existingCount = batch.length - insertedCount;

      totalInserted += insertedCount;

      totalExisting += existingCount;

      processed += batch.length;

      console.log(
        `Attendance progress: ` +
          `${processed}/${validLogs.length}` +
          ` | New: ${totalInserted}` +
          ` | Existing: ${totalExisting}`,
      );

      /*
      |--------------------------------------------------------------------------
      | Live Broadcast
      |--------------------------------------------------------------------------
      |
      | Don't broadcast the initial historical import.
      |
      | After the first successful synchronization,
      | every newly inserted attendance punch can be
      | broadcast to the frontend.
      |
      */

      if (initialAttendanceSyncCompleted) {
        for (const row of inserted) {
          try {
            await broadcastNewLog(row);
          } catch (broadcastError) {
            console.error("Attendance broadcast error:", broadcastError);
          }
        }
      }
    } catch (error) {
      console.error("");
      console.error("Attendance batch insert failed.");

      console.error(`Batch: ${start + 1} - ${start + batch.length}`);

      console.error(error);

      throw error;
    }
  }

  console.log("");
  console.log("=================================");
  console.log("Attendance Sync Complete");
  console.log("=================================");

  console.log(`Device records : ${attendance.length}`);

  console.log(`Valid records  : ${validLogs.length}`);

  console.log(`New inserted   : ${totalInserted}`);

  console.log(`Already exists : ${totalExisting}`);

  console.log("=================================");
  console.log("");

  /*
   * First historical synchronization
   * has now completed.
   */
  initialAttendanceSyncCompleted = true;
}

/*
|--------------------------------------------------------------------------
| Main Device Synchronization
|--------------------------------------------------------------------------
*/

async function synchronizeDevice() {
  if (syncRunning) {
    console.log("ZKTeco sync is already running. Skipping.");

    return;
  }

  syncRunning = true;

  /*
   * 30-second communication timeout
   */
  const zk = new ZKLib(deviceIP, devicePort, 30000);

  activeZk = zk;

  let connected = false;

  try {
    console.log("");
    console.log("=================================");

    console.log("Starting ZKTeco Synchronization");

    console.log("=================================");

    console.log(`Device: ${deviceIP}:${devicePort}`);

    /*
    |--------------------------------------------------------------------------
    | Connect
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("Connecting to ZKTeco device...");

    await zk.createSocket();

    connected = true;

    console.log("Connected to ZKTeco device");

    /*
    |--------------------------------------------------------------------------
    | Download Users
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("Downloading users...");

    const userData = await zk.getUsers();

    console.log(`Received ${userData.data.length} users from device`);

    /*
    |--------------------------------------------------------------------------
    | Download Attendance
    |--------------------------------------------------------------------------
    */

    console.log("");
    console.log("Downloading attendance...");

    const attendanceData = await zk.getAttendances();

    console.log(
      `Received ${attendanceData.data.length} attendance records from device`,
    );

    /*
    |--------------------------------------------------------------------------
    | Disconnect Immediately
    |--------------------------------------------------------------------------
    |
    | PostgreSQL processing may take time.
    | We don't need to keep the ZKTeco
    | connection open while processing.
    |
    */

    console.log("");
    console.log("Disconnecting from ZKTeco device...");

    await zk.disconnect();

    connected = false;

    console.log("Disconnected from ZKTeco device");

    /*
    |--------------------------------------------------------------------------
    | PostgreSQL User Sync
    |--------------------------------------------------------------------------
    */

    await syncZktecoUsers(userData.data as ZKTecoUser[]);

    /*
    |--------------------------------------------------------------------------
    | PostgreSQL Attendance Sync
    |--------------------------------------------------------------------------
    */

    await syncAttendance(attendanceData.data as RawAttendanceLog[]);

    console.log("ZKTeco synchronization successfully completed.");
  } catch (error) {
    console.error("");
    console.error("ZKTeco synchronization error:");

    console.error(error);
  } finally {
    /*
     * Emergency cleanup if an error
     * happened before normal disconnect.
     */
    if (connected) {
      try {
        await zk.disconnect();

        console.log("Disconnected from ZKTeco device");
      } catch {
        // Ignore cleanup failure
      }
    }

    syncRunning = false;
  }
}

/*
|--------------------------------------------------------------------------
| Polling Loop
|--------------------------------------------------------------------------
*/

async function pollingLoop() {
  if (!serviceStarted) {
    return;
  }

  await synchronizeDevice();

  /*
   * Schedule only AFTER the current
   * synchronization has completely finished.
   *
   * This prevents overlapping polls.
   */
  if (serviceStarted) {
    timer = setTimeout(pollingLoop, pollingInterval);
  }
}

/*
|--------------------------------------------------------------------------
| Start Service
|--------------------------------------------------------------------------
*/

export function startZktecoSync() {
  if (serviceStarted) {
    console.log("ZKTeco synchronization service is already running.");

    return;
  }

  serviceStarted = true;

  console.log("Starting ZKTeco synchronization service...");

  void pollingLoop();
}

/*
|--------------------------------------------------------------------------
| Stop Service
|--------------------------------------------------------------------------
*/

export async function stopZktecoSync() {
  serviceStarted = false;

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  if (activeZk) {
    try {
      console.log("Disconnecting active ZKTeco connection...");

      await activeZk.disconnect();

      console.log("Active ZKTeco connection disconnected.");
    } catch (error) {
      console.warn("ZKTeco disconnect warning:", error);
    }

    activeZk = null;
  }

  syncRunning = false;

  console.log("ZKTeco synchronization service stopped.");
}
