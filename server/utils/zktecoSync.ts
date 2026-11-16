// @ts-nocheck

import ZKLib from "node-zklib";
import { randomUUID } from "node:crypto";

import { query } from "~/server/utils/db";

import * as attendanceStreamUtils from "~/server/utils/attendanceStream";

/* ==========================================================================
   DEVICE CONFIGURATION
============================================================================ */

const DEVICE_IP = process.env.ZKTECO_IP || "192.168.254.201";

const DEVICE_PORT = Number(process.env.ZKTECO_PORT || 4370);

/*
 * ZKTeco connection timeout.
 */
const DEVICE_TIMEOUT = Number(process.env.ZKTECO_TIMEOUT || 10000);

/*
 * node-zklib local/inport.
 */
const DEVICE_INPORT = Number(process.env.ZKTECO_INPORT || 5200);

/* ==========================================================================
   SYNC INTERVALS
============================================================================ */

/*
 * Attendance watcher:
 *
 * Check device approximately
 * every 3 seconds.
 */
const POLL_INTERVAL = Number(process.env.ZKTECO_POLL_INTERVAL || 3000);

/*
 * Even when the device user count
 * does not change, refresh users
 * every 60 seconds.
 *
 * This catches:
 *
 * - employee name changes
 * - card changes
 * - role changes
 * - unusual firmware behavior
 */
const USER_SYNC_INTERVAL = Number(
  process.env.ZKTECO_USER_SYNC_INTERVAL || 60000,
);

/* ==========================================================================
   TYPES
============================================================================ */

interface ZktecoInfo {
  userCounts?: number;
  userCount?: number;

  logCounts?: number;
  logCount?: number;

  logCapacity?: number;
  userCapacity?: number;
}

interface ZktecoUser {
  uid?: number;

  role?: number;

  name?: string;

  cardno?: string | number;
  cardNo?: string | number;
  card_no?: string | number;

  userId?: string | number;
  user_id?: string | number;
  userid?: string | number;
}

interface ZktecoAttendance {
  userSn?: number;

  deviceUserId?: string | number;

  userId?: string | number;
  user_id?: string | number;

  recordTime?: Date | string;

  timestamp?: Date | string;

  ip?: string;
}

/* ==========================================================================
   GLOBAL STATE
============================================================================ */

/*
 * Nitro development HMR can reload server
 * modules. Keep the sync state on globalThis
 * so we don't accidentally start two watchers.
 */

const globalState = globalThis as typeof globalThis & {
  __sncZktecoSyncStarted?: boolean;

  __sncZktecoSyncRunning?: boolean;

  __sncZktecoLastUserCount?: number | null;

  __sncZktecoLastUserSyncAt?: number;
};

if (globalState.__sncZktecoLastUserCount === undefined) {
  globalState.__sncZktecoLastUserCount = null;
}

if (globalState.__sncZktecoLastUserSyncAt === undefined) {
  globalState.__sncZktecoLastUserSyncAt = 0;
}

/* ==========================================================================
   CREATE DEVICE INSTANCE
============================================================================ */

const createDevice = () => {
  return new ZKLib(DEVICE_IP, DEVICE_PORT, DEVICE_TIMEOUT, DEVICE_INPORT);
};

/* ==========================================================================
   SYNC STATE TABLE
============================================================================ */

/*
 * We store the device log count.
 *
 * This prevents repeatedly downloading
 * attendance when nothing changed.
 */

const ensureSyncStateTable = async () => {
  await query(
    `
      CREATE TABLE IF NOT EXISTS
      public.zkteco_sync_state
      (
        device_ip TEXT PRIMARY KEY,

        last_device_log_count INTEGER
          NOT NULL
          DEFAULT 0,

        updated_at TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW()
      )
      `,
  );
};

/* ==========================================================================
   GET LAST DEVICE LOG COUNT
============================================================================ */

const getLastDeviceLogCount = async () => {
  const result = await query(
    `
        SELECT
          last_device_log_count
        FROM
          public.zkteco_sync_state
        WHERE
          device_ip = $1
        LIMIT 1
        `,
    [DEVICE_IP],
  );

  if (!result?.rows?.length) {
    return 0;
  }

  return Number(result.rows[0]?.last_device_log_count ?? 0);
};

/* ==========================================================================
   SAVE DEVICE LOG COUNT
============================================================================ */

const saveDeviceLogCount = async (count: number) => {
  await query(
    `
      INSERT INTO
        public.zkteco_sync_state
      (
        device_ip,
        last_device_log_count,
        updated_at
      )
      VALUES
      (
        $1,
        $2,
        NOW()
      )

      ON CONFLICT
        (device_ip)

      DO UPDATE SET
        last_device_log_count =
          EXCLUDED.last_device_log_count,

        updated_at =
          NOW()
      `,
    [DEVICE_IP, count],
  );
};

/* ==========================================================================
   GET DEVICE LOG COUNT
============================================================================ */

const getDeviceLogCount = (info: ZktecoInfo | null | undefined) => {
  const count = Number(info?.logCounts ?? info?.logCount ?? 0);

  return Number.isFinite(count) ? count : 0;
};

/* ==========================================================================
   GET DEVICE USER COUNT
============================================================================ */

const getDeviceUserCount = (info: ZktecoInfo | null | undefined) => {
  const count = Number(info?.userCounts ?? info?.userCount ?? 0);

  return Number.isFinite(count) ? count : 0;
};

/* ==========================================================================
   EXTRACT RESPONSE DATA
============================================================================ */

/*
 * node-zklib versions can return:
 *
 * [
 *   ...
 * ]
 *
 * or:
 *
 * {
 *   data: [...]
 * }
 */

const extractArray = (response: any) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

/* ==========================================================================
   DEVICE USER ID
============================================================================ */

/*
 * IMPORTANT:
 *
 * uid is the device internal slot.
 *
 * userId is the biometric employee/user ID
 * visible on the ZKTeco device.
 *
 * Attendance should be joined by userId,
 * NOT by uid/userSn.
 */

const getUserId = (user: ZktecoUser) => {
  const value = Number(user.userId ?? user.user_id ?? user.userid);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
};

/* ==========================================================================
   DEVICE USER CARD
============================================================================ */

const getUserCard = (user: ZktecoUser) => {
  const value = user.cardno ?? user.cardNo ?? user.card_no ?? "";

  return String(value).trim();
};

/* ==========================================================================
   UPSERT BIOMETRIC USER
============================================================================ */

/*
 * USER SYNC POLICY
 *
 * Biometric device controlled:
 *
 * - user_id
 * - uid
 * - role
 * - card_no
 *
 * System controlled:
 *
 * - name
 * - department
 * - department_docid
 * - department_id
 *
 * IMPORTANT:
 *
 * The biometric name is only used when
 * creating a NEW user or when the local
 * database name is empty.
 *
 * This prevents periodic biometric sync
 * from restoring an old employee name
 * after it has been edited in the system.
 */

const upsertUser = async (user: ZktecoUser) => {
  const userId = getUserId(user);

  if (!userId) {
    return false;
  }

  /* ================================================================
       DEVICE UID
    ================================================================= */

  const uid = Number(user.uid ?? 0);

  /* ================================================================
       DEVICE ROLE
    ================================================================= */

  const role = Number(user.role ?? 0);

  /* ================================================================
       DEVICE NAME
    ================================================================= */

  const deviceName = String(user.name ?? "").trim();

  /* ================================================================
       CARD NUMBER
    ================================================================= */

  const cardNo = getUserCard(user);

  /* ================================================================
       CHECK EXISTING USER
    ================================================================= */

  const existingResult = await query(
    `
        SELECT
          user_id,
          uid,
          role,
          name,
          card_no
        FROM
          public.user_accounts
        WHERE
          user_id = $1
        LIMIT 1
        `,
    [userId],
  );

  const existingUser = existingResult?.rows?.[0];

  /* ================================================================
       EXISTING USER
    ================================================================= */

  if (existingUser) {
    /*
     * Do NOT replace an existing local
     * employee name with the biometric
     * device name.
     *
     * Only use the biometric name when
     * the local name is empty.
     */

    await query(
      `
        UPDATE
          public.user_accounts

        SET
          uid = $1,

          role = $2,

          card_no =
            CASE
              WHEN NULLIF(
                TRIM(
                  $3::text
                ),
                ''
              ) IS NULL

              THEN card_no

              ELSE $3
            END,

          name =
            CASE
              WHEN NULLIF(
                TRIM(
                  COALESCE(
                    name,
                    ''
                  )
                ),
                ''
              ) IS NULL

              THEN
                CASE
                  WHEN NULLIF(
                    TRIM(
                      $4::text
                    ),
                    ''
                  ) IS NULL

                  THEN CONCAT(
                    'User ',
                    $5
                  )

                  ELSE $4
                END

              ELSE name
            END

        WHERE
          user_id = $5
        `,
      [
        Number.isFinite(uid) ? uid : 0,

        Number.isFinite(role) ? role : 0,

        cardNo,

        deviceName,

        userId,
      ],
    );

    return true;
  }

  /* ================================================================
       NEW USER
    ================================================================= */

  /*
   * For a newly enrolled biometric
   * employee, use the information from
   * the device to create the account.
   */

  await query(
    `
      INSERT INTO
        public.user_accounts
      (
        uid,
        role,
        name,
        card_no,
        user_id,
        created_at
      )

      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW()
      )
      `,
    [
      Number.isFinite(uid) ? uid : 0,

      Number.isFinite(role) ? role : 0,

      deviceName || `User ${userId}`,

      cardNo,

      userId,
    ],
  );

  console.log("[ZKTeco] New biometric user added:", {
    userId,
    name: deviceName || `User ${userId}`,
  });

  return true;
};

/* ==========================================================================
   SYNC BIOMETRIC USERS
============================================================================ */

const syncUsers = async (zk: any, deviceUserCount: number) => {
  console.log("[ZKTeco] Synchronizing biometric users...");

  const response = await zk.getUsers();

  const users = extractArray(response) as ZktecoUser[];

  console.log(`[ZKTeco] Users received from device: ${users.length}`);

  let processed = 0;

  let skipped = 0;

  for (const user of users) {
    try {
      const success = await upsertUser(user);

      if (success) {
        processed++;
      } else {
        skipped++;
      }
    } catch (error) {
      skipped++;

      console.error("[ZKTeco] Failed syncing biometric user:", {
        user,
        error,
      });
    }
  }

  globalState.__sncZktecoLastUserCount =
    deviceUserCount > 0 ? deviceUserCount : users.length;

  globalState.__sncZktecoLastUserSyncAt = Date.now();

  console.log(
    `[ZKTeco] User sync completed. Processed: ${processed}, skipped: ${skipped}`,
  );
};

/* ==========================================================================
   SHOULD SYNC USERS
============================================================================ */

const shouldSyncUsers = (deviceUserCount: number) => {
  const previousCount = globalState.__sncZktecoLastUserCount;

  const lastSync = globalState.__sncZktecoLastUserSyncAt ?? 0;

  const now = Date.now();

  /*
   * First server run.
   */
  if (previousCount === null) {
    return true;
  }

  /*
   * Employee enrolled or deleted.
   */
  if (deviceUserCount > 0 && deviceUserCount !== previousCount) {
    return true;
  }

  /*
   * Periodic refresh.
   *
   * Important because changing an employee
   * name/card doesn't necessarily change
   * the total number of users.
   */
  if (now - lastSync >= USER_SYNC_INTERVAL) {
    return true;
  }

  return false;
};

/* ==========================================================================
   ATTENDANCE USER ID
============================================================================ */

const getAttendanceUserId = (record: ZktecoAttendance) => {
  /*
   * node-zklib getAttendances()
   * gives deviceUserId in the setup
   * used by this system.
   */

  const value = Number(record.deviceUserId ?? record.userId ?? record.user_id);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
};

/* ==========================================================================
   ATTENDANCE DEVICE UID
============================================================================ */

const getAttendanceDeviceUid = (record: ZktecoAttendance) => {
  const value = Number(record.userSn ?? 0);

  return Number.isFinite(value) ? value : 0;
};

/* ==========================================================================
   ATTENDANCE TIME
============================================================================ */

const getAttendanceTime = (record: ZktecoAttendance) => {
  const raw = record.recordTime ?? record.timestamp;

  if (!raw) {
    return null;
  }

  const date = raw instanceof Date ? raw : new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  /*
   * Ignore corrupt historical records.
   *
   * We previously encountered device
   * entries around year 2000.
   */
  if (date.getFullYear() < 2020) {
    return null;
  }

  return date;
};

/* ==========================================================================
   INSERT ATTENDANCE
============================================================================ */

const insertAttendance = async (record: ZktecoAttendance) => {
  const userId = getAttendanceUserId(record);

  const timestamp = getAttendanceTime(record);

  if (!userId || !timestamp) {
    return {
      inserted: false,

      payload: null,
    };
  }

  const deviceUid = getAttendanceDeviceUid(record);

  /*
   * ON CONFLICT DO NOTHING
   *
   * This works with the existing
   * attendance unique constraints and
   * prevents duplicate punches.
   */

  const result = await query(
    `
        INSERT INTO
          public.attendance_logs
        (
          document_id,

          device_uid,

          user_id,

          "timestamp",

          created_at,

          updated_at,

          published_at
        )

        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          NOW(),
          NOW(),
          NOW()
        )

        ON CONFLICT
        DO NOTHING

        RETURNING
          id,
          user_id,
          "timestamp"
        `,
    [randomUUID(), deviceUid, userId, timestamp],
  );

  const inserted = Boolean(result?.rows?.length);

  return {
    inserted,

    payload: inserted
      ? {
          id: result.rows[0]?.id,

          user_id: userId,

          device_uid: deviceUid,

          timestamp: timestamp.toISOString(),
        }
      : null,
  };
};

/* ==========================================================================
   BROADCAST ATTENDANCE
============================================================================ */

/*
 * Keep compatibility with the existing
 * attendanceStream utility.
 *
 * Different versions of the project may
 * call the broadcast function differently.
 */

const broadcastAttendance = (payload: any) => {
  try {
    const utils = attendanceStreamUtils as any;

    if (typeof utils.broadcastAttendance === "function") {
      utils.broadcastAttendance(payload);

      return;
    }

    if (typeof utils.broadcastAttendanceEvent === "function") {
      utils.broadcastAttendanceEvent(payload);

      return;
    }

    if (typeof utils.broadcast === "function") {
      utils.broadcast("attendance", payload);
    }
  } catch (error) {
    /*
     * Do not stop biometric sync
     * because SSE broadcasting failed.
     */
    console.warn("[ZKTeco] Unable to broadcast attendance:", error);
  }
};

/* ==========================================================================
   SYNC ATTENDANCE
============================================================================ */

const syncAttendance = async (zk: any, deviceLogCount: number) => {
  const previousLogCount = await getLastDeviceLogCount();

  /* ================================================================
       NOTHING NEW
    ================================================================= */

  if (deviceLogCount === previousLogCount) {
    return;
  }

  /* ================================================================
       DEVICE LOGS WERE CLEARED
    ================================================================= */

  if (deviceLogCount < previousLogCount) {
    console.warn(
      `[ZKTeco] Device log count decreased: ${previousLogCount} -> ${deviceLogCount}`,
    );

    await saveDeviceLogCount(deviceLogCount);

    return;
  }

  /* ================================================================
       NUMBER OF NEW PUNCHES
    ================================================================= */

  const newRecordCount = deviceLogCount - previousLogCount;

  console.log(`[ZKTeco] New attendance detected: +${newRecordCount} punch(es)`);

  console.log(
    `[ZKTeco] Device logs: ${deviceLogCount}, previous: ${previousLogCount}`,
  );

  /* ================================================================
       GET DEVICE ATTENDANCE
    ================================================================= */

  const response = await zk.getAttendances();

  const attendance = extractArray(response) as ZktecoAttendance[];

  if (attendance.length === 0) {
    console.warn(
      "[ZKTeco] Device reported new logs but getAttendances() returned no records.",
    );

    return;
  }

  /* ================================================================
       SORT ATTENDANCE
    ================================================================= */

  /*
   * Never depend purely on the order
   * returned by the biometric device.
   *
   * Sort oldest -> newest first.
   */

  const sortedAttendance = [...attendance]
    .filter((record) => Boolean(getAttendanceTime(record)))
    .sort((a, b) => {
      const timeA = getAttendanceTime(a)?.getTime() ?? 0;

      const timeB = getAttendanceTime(b)?.getTime() ?? 0;

      return timeA - timeB;
    });

  /* ================================================================
       GET ONLY NEWEST RECORDS
    ================================================================= */

  /*
   * Example:
   *
   * previous device count = 66,400
   * current device count  = 66,402
   *
   * newRecordCount = 2
   *
   * We only need the last 2 records.
   */

  const candidateCount = Math.max(newRecordCount, 1);

  /*
   * Include a small overlap.
   *
   * This protects against rare device
   * ordering/count timing differences.
   *
   * Database unique constraints will
   * safely ignore duplicates.
   */

  const overlap = 5;

  const recordsToProcess = sortedAttendance.slice(-(candidateCount + overlap));

  console.log(
    `[ZKTeco] Processing ${recordsToProcess.length} recent record(s) instead of ${sortedAttendance.length}.`,
  );

  /* ================================================================
       INSERT
    ================================================================= */

  let insertedCount = 0;

  let duplicateCount = 0;

  const insertedPayloads: any[] = [];

  for (const record of recordsToProcess) {
    try {
      const result = await insertAttendance(record);

      if (result.inserted) {
        insertedCount++;

        if (result.payload) {
          insertedPayloads.push(result.payload);
        }
      } else {
        duplicateCount++;
      }
    } catch (error) {
      console.error("[ZKTeco] Attendance insert failed:", {
        record,
        error,
      });
    }
  }

  /* ================================================================
       SAVE DEVICE COUNT
    ================================================================= */

  await saveDeviceLogCount(deviceLogCount);

  console.log(
    `[ZKTeco] Attendance sync completed. New: ${insertedCount}, duplicates: ${duplicateCount}`,
  );

  /* ================================================================
       BROADCAST IMMEDIATELY
    ================================================================= */

  if (insertedPayloads.length > 0) {
    const latestPayload = insertedPayloads[insertedPayloads.length - 1];

    console.log("[ZKTeco] Broadcasting attendance event:", latestPayload);

    broadcastAttendance({
      device_ip: DEVICE_IP,

      inserted: insertedPayloads.length,

      latest: latestPayload,

      synced_at: new Date().toISOString(),
    });
  }
};

/* ==========================================================================
   ONE SYNC CYCLE
============================================================================ */

const runSyncCycle = async () => {
  /*
   * Prevent the next 3-second cycle
   * from starting while the current
   * connection is still working.
   */
  if (globalState.__sncZktecoSyncRunning) {
    return;
  }

  globalState.__sncZktecoSyncRunning = true;

  const zk = createDevice();

  let connected = false;

  try {
    await zk.createSocket();

    connected = true;

    const info = (await zk.getInfo()) as ZktecoInfo;

    const deviceLogCount = getDeviceLogCount(info);

    const deviceUserCount = getDeviceUserCount(info);

    /*
     * Keep this console output light.
     * It is useful when diagnosing the
     * biometric device.
     */
    console.log("[ZKTeco] Device status:", {
      users: deviceUserCount,

      logs: deviceLogCount,
    });

    /* ================================================================
         USER SYNCHRONIZATION
      ================================================================= */

    if (shouldSyncUsers(deviceUserCount)) {
      const previousCount = globalState.__sncZktecoLastUserCount;

      if (previousCount !== null && deviceUserCount !== previousCount) {
        console.log(
          `[ZKTeco] User count changed: ${previousCount} -> ${deviceUserCount}`,
        );
      }

      await syncUsers(zk, deviceUserCount);
    }

    /* ================================================================
         ATTENDANCE SYNCHRONIZATION
      ================================================================= */

    await syncAttendance(zk, deviceLogCount);
  } catch (error: any) {
    /*
     * The device may occasionally be
     * busy. Don't kill Nitro.
     *
     * The watcher will retry during the
     * next synchronization cycle.
     */

    console.error(
      "[ZKTeco] Synchronization cycle failed:",
      error?.message ?? error,
    );
  } finally {
    if (connected) {
      try {
        await zk.disconnect();
      } catch (error) {
        /*
         * Ignore disconnect errors.
         */
      }
    }

    globalState.__sncZktecoSyncRunning = false;
  }
};

/* ==========================================================================
   WATCHER LOOP
============================================================================ */

const scheduleNextCycle = () => {
  setTimeout(async () => {
    await runSyncCycle();

    scheduleNextCycle();
  }, POLL_INTERVAL);
};

/* ==========================================================================
   START ZKTECO SYNC
============================================================================ */

export const startZktecoSync = async () => {
  /*
   * Prevent duplicate Nitro/HMR watchers.
   */

  if (globalState.__sncZktecoSyncStarted) {
    console.log("[ZKTeco] Synchronization watcher already running.");

    return;
  }

  globalState.__sncZktecoSyncStarted = true;

  console.log("[ZKTeco] Starting synchronization service...");

  console.log("[ZKTeco] Device:", `${DEVICE_IP}:${DEVICE_PORT}`);

  console.log("[ZKTeco] Attendance interval:", `${POLL_INTERVAL} ms`);

  console.log("[ZKTeco] User refresh interval:", `${USER_SYNC_INTERVAL} ms`);

  try {
    await ensureSyncStateTable();

    /*
     * First cycle immediately.
     */
    await runSyncCycle();
  } catch (error) {
    console.error("[ZKTeco] Initial synchronization failed:", error);
  }

  /*
   * Continue synchronization.
   */
  scheduleNextCycle();
};
