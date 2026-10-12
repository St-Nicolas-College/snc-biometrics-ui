// @ts-ignore
import ZKLib from "node-zklib";

import { query } from "./db";

import { broadcastNewLog } from "./attendanceStream";

const deviceIP = process.env.ZKTECO_IP ?? "";

const devicePort = Number(process.env.ZKTECO_PORT ?? 4370);

/*
 * Approximately 0-3 second latency.
 */
const pollingInterval = 3000;

const batchSize = 500;

let serviceRunning = false;

let pollRunning = false;

let timer: NodeJS.Timeout | null = null;

/*
|--------------------------------------------------------------------------
| Ensure State Table
|--------------------------------------------------------------------------
*/

async function ensureState() {
  await query(`
    CREATE TABLE IF NOT EXISTS
      public.zkteco_sync_state
    (
      device_ip
        VARCHAR(45)
        PRIMARY KEY,

      last_device_log_count
        INTEGER
        NOT NULL
        DEFAULT 0,

      updated_at
        TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(
    `
    INSERT INTO
      public.zkteco_sync_state
    (
      device_ip
    )
    VALUES ($1)

    ON CONFLICT (
      device_ip
    )
    DO NOTHING
    `,
    [deviceIP],
  );
}

/*
|--------------------------------------------------------------------------
| Known Device Count
|--------------------------------------------------------------------------
*/

async function getKnownCount() {
  const rows = await query(
    `
      SELECT
        last_device_log_count

      FROM
        public.zkteco_sync_state

      WHERE
        device_ip = $1

      LIMIT 1
      `,
    [deviceIP],
  );

  return Number(rows[0]?.last_device_log_count ?? 0);
}

async function setKnownCount(count: number) {
  await query(
    `
    UPDATE
      public.zkteco_sync_state

    SET
      last_device_log_count = $2,
      updated_at = CURRENT_TIMESTAMP

    WHERE
      device_ip = $1
    `,
    [deviceIP, count],
  );
}

/*
|--------------------------------------------------------------------------
| Validate Attendance
|--------------------------------------------------------------------------
*/

function isValidLog(log: any) {
  const userId = Number(log.deviceUserId);

  if (Number.isNaN(userId) || userId <= 0) {
    return false;
  }

  if (!log.recordTime) {
    return false;
  }

  const time = new Date(log.recordTime);

  if (Number.isNaN(time.getTime())) {
    return false;
  }

  /*
   * Ignore the bogus year-2000
   * records found in this device.
   */
  if (time.getFullYear() < 2020) {
    return false;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| Insert Batch
|--------------------------------------------------------------------------
*/

async function insertBatch(logs: any[]) {
  const values: any[] = [];

  const placeholders: string[] = [];

  for (const log of logs) {
    if (!isValidLog(log)) {
      continue;
    }

    const userId = Number(log.deviceUserId);

    const timestamp = new Date(log.recordTime);

    const deviceUid =
      log.userSn !== undefined && log.userSn !== null
        ? Number(log.userSn)
        : null;

    const offset = values.length;

    values.push(
      Number.isNaN(deviceUid) ? null : deviceUid,

      userId,

      timestamp,
    );

    placeholders.push(`
      (
        $${offset + 1},
        $${offset + 2},
        $${offset + 3},
        CURRENT_TIMESTAMP
      )
    `);
  }

  if (placeholders.length === 0) {
    return [];
  }

  return await query(
    `
    INSERT INTO
      public.attendance_logs
    (
      device_uid,
      user_id,
      "timestamp",
      created_at
    )

    VALUES
      ${placeholders.join(",")}

    ON CONFLICT (
      user_id,
      "timestamp"
    )

    DO NOTHING

    RETURNING *
    `,
    values,
  );
}

/*
|--------------------------------------------------------------------------
| Reconcile
|--------------------------------------------------------------------------
*/

async function reconcile(zk: any, deviceCount: number) {
  console.log("");
  console.log("New biometric attendance detected.");

  console.log(`Device count: ${deviceCount}`);

  const attendance = await zk.getAttendances();

  /*
   * Important optimization:
   *
   * We still receive the device collection,
   * but PostgreSQL will only insert missing
   * records.
   */

  const newRows: any[] = [];

  for (let start = 0; start < attendance.data.length; start += batchSize) {
    const batch = attendance.data.slice(start, start + batchSize);

    const inserted = await insertBatch(batch);

    newRows.push(...inserted);
  }

  /*
   * Update count AFTER successful
   * reconciliation.
   */
  await setKnownCount(deviceCount);

  console.log(`New attendance rows: ${newRows.length}`);

  /*
   * Oldest -> newest
   */
  newRows.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  /*
   * Send only genuinely new records
   * to the browser.
   */
  for (const row of newRows) {
    console.log("");
    console.log(">>> NEW BIOMETRIC PUNCH <<<");

    console.log(`User: ${row.user_id}`);

    console.log(`Time: ${row.timestamp}`);

    await broadcastNewLog(row);
  }
}

/*
|--------------------------------------------------------------------------
| Poll Device
|--------------------------------------------------------------------------
*/

async function poll() {
  if (!serviceRunning || pollRunning) {
    return;
  }

  pollRunning = true;

  const zk = new ZKLib(deviceIP, devicePort, 10000);

  let connected = false;

  try {
    await zk.createSocket();

    connected = true;

    const info = await zk.getInfo();

    const deviceCount = Number(info.logCounts ?? 0);

    const knownCount = await getKnownCount();

    /*
     * First start after installing
     * the watcher.
     */
    if (knownCount === 0) {
      console.log(`Initializing attendance count: ${deviceCount}`);

      /*
       * Existing attendance is already
       * in PostgreSQL, so don't download
       * everything just because state
       * table is new.
       */
      await setKnownCount(deviceCount);
    } else if (deviceCount > knownCount) {

    /*
     * New punch(es)
     */
      console.log("");
      console.log("=================================");

      console.log("ATTENDANCE CHANGE DETECTED");

      console.log(`Previous : ${knownCount}`);

      console.log(`Current  : ${deviceCount}`);

      console.log(`New logs : ${deviceCount - knownCount}`);

      console.log("=================================");

      await reconcile(zk, deviceCount);
    } else if (deviceCount < knownCount) {

    /*
     * Device logs were cleared.
     */
      console.warn(
        `ZKTeco log count decreased: ${knownCount} -> ${deviceCount}`,
      );

      await setKnownCount(deviceCount);
    }
  } catch (error) {
    console.error("ZKTeco watcher error:", error);
  } finally {
    if (connected) {
      try {
        await zk.disconnect();
      } catch {
        // Ignore
      }
    }

    pollRunning = false;
  }
}

/*
|--------------------------------------------------------------------------
| Loop
|--------------------------------------------------------------------------
*/

async function loop() {
  if (!serviceRunning) {
    return;
  }

  await poll();

  if (serviceRunning) {
    timer = setTimeout(loop, pollingInterval);
  }
}

/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

export async function startZktecoSync() {
  if (serviceRunning) {
    return;
  }

  await ensureState();

  serviceRunning = true;

  console.log("ZKTeco near-real-time watcher started.");

  console.log(`Device: ${deviceIP}:${devicePort}`);

  console.log(`Detection interval: ${pollingInterval / 1000} seconds`);

  void loop();
}

/*
|--------------------------------------------------------------------------
| Stop
|--------------------------------------------------------------------------
*/

export function stopZktecoSync() {
  serviceRunning = false;

  if (timer) {
    clearTimeout(timer);

    timer = null;
  }

  console.log("ZKTeco watcher stopped.");
}
