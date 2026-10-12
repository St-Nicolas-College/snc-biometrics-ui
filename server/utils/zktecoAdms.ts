import { query } from "./db";

import { broadcastNewLog } from "./attendanceStream";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export interface AdmsAttendance {
  userId: number;

  timestamp: string;

  status: number | null;

  verifyType: number | null;

  workCode: string | null;

  rawLine: string;
}

/*
|--------------------------------------------------------------------------
| Database initialization
|--------------------------------------------------------------------------
*/

export async function ensureAdmsTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS
      public.zkteco_adms_devices
    (
      device_sn
        VARCHAR(64)
        PRIMARY KEY,

      last_seen_at
        TIMESTAMP WITHOUT TIME ZONE,

      last_attlog_stamp
        VARCHAR(255)
        DEFAULT '0',

      user_agent
        TEXT,

      created_at
        TIMESTAMP WITHOUT TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

      updated_at
        TIMESTAMP WITHOUT TIME ZONE
        DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS
      public.zkteco_adms_punches
    (
      id
        BIGSERIAL
        PRIMARY KEY,

      device_sn
        VARCHAR(64)
        NOT NULL,

      user_id
        INTEGER
        NOT NULL,

      "timestamp"
        TIMESTAMP WITHOUT TIME ZONE
        NOT NULL,

      punch_status
        INTEGER,

      verify_type
        INTEGER,

      work_code
        VARCHAR(100),

      raw_line
        TEXT,

      received_at
        TIMESTAMP WITHOUT TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT
        zkteco_adms_punches_unique

      UNIQUE (
        device_sn,
        user_id,
        "timestamp"
      )
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS
      idx_adms_punch_user_time

    ON
      public.zkteco_adms_punches
    (
      user_id,
      "timestamp"
    )
  `);
}

/*
|--------------------------------------------------------------------------
| Device validation
|--------------------------------------------------------------------------
*/

export function isAllowedDevice(sn: string) {
  const allowed = process.env.ZKTECO_DEVICE_SN?.trim();

  if (!allowed) {
    return true;
  }

  return sn === allowed;
}

/*
|--------------------------------------------------------------------------
| Register / touch device
|--------------------------------------------------------------------------
*/

export async function touchAdmsDevice(sn: string, userAgent?: string) {
  await query(
    `
    INSERT INTO
      public.zkteco_adms_devices
    (
      device_sn,
      last_seen_at,
      user_agent,
      created_at,
      updated_at
    )

    VALUES (
      $1,
      CURRENT_TIMESTAMP,
      $2,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )

    ON CONFLICT (
      device_sn
    )

    DO UPDATE SET

      last_seen_at =
        CURRENT_TIMESTAMP,

      user_agent =
        EXCLUDED.user_agent,

      updated_at =
        CURRENT_TIMESTAMP
    `,
    [sn, userAgent ?? null],
  );
}

/*
|--------------------------------------------------------------------------
| Get ATTLOG stamp
|--------------------------------------------------------------------------
*/

export async function getAttendanceStamp(sn: string) {
  const rows = await query(
    `
      SELECT
        last_attlog_stamp

      FROM
        public.zkteco_adms_devices

      WHERE
        device_sn = $1

      LIMIT 1
      `,
    [sn],
  );

  return rows[0]?.last_attlog_stamp ?? "0";
}

/*
|--------------------------------------------------------------------------
| Update ATTLOG stamp
|--------------------------------------------------------------------------
*/

export async function updateAttendanceStamp(sn: string, stamp?: string) {
  if (!stamp) {
    return;
  }

  await query(
    `
    UPDATE
      public.zkteco_adms_devices

    SET
      last_attlog_stamp =
        $2,

      last_seen_at =
        CURRENT_TIMESTAMP,

      updated_at =
        CURRENT_TIMESTAMP

    WHERE
      device_sn =
        $1
    `,
    [sn, stamp],
  );
}

/*
|--------------------------------------------------------------------------
| Build Device Options
|--------------------------------------------------------------------------
|
| Realtime=1 is the important part.
|
| With real-time enabled, newly generated
| attendance data is pushed immediately.
|
*/

export function buildAdmsOptions(sn: string, stamp: string) {
  const currentStamp = stamp || "0";

  return [
    `GET OPTION FROM: ${sn}`,

    `Stamp=${currentStamp}`,

    "OpStamp=0",

    "PhotoStamp=0",

    `ATTLOGStamp=${currentStamp}`,

    "OPERLOGStamp=0",

    "ATTPHOTOStamp=None",

    "ErrorDelay=30",

    "Delay=10",

    "TransTimes=00:00;23:59",

    "TransInterval=1",

    "TransFlag=TransData AttLog OpLog EnrollUser ChgUser",

    "Realtime=1",

    "Encrypt=None",

    "TimeZone=8",

    "ServerVer=2.4.1",

    "PushProtVer=2.4.1",

    "",
  ].join("\r\n");
}

/*
|--------------------------------------------------------------------------
| Number parser
|--------------------------------------------------------------------------
*/

function nullableNumber(value?: string | null) {
  if (value === undefined || value === null || value.trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number) ? null : number;
}

/*
|--------------------------------------------------------------------------
| Parse ATTLOG body
|--------------------------------------------------------------------------
*/

export function parseAttendanceBody(body: string): AdmsAttendance[] {
  const records: AdmsAttendance[] = [];

  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    /*
     * ADMS records use HT / TAB
     * between fields.
     */

    const fields = line.split("\t");

    if (fields.length < 2) {
      console.warn("[ADMS] Invalid ATTLOG line:", line);

      continue;
    }

    let pin = fields[0]?.trim() ?? "";

    /*
     * Some firmware sends:
     *
     * PIN=71
     *
     * while others simply send:
     *
     * 71
     */

    pin = pin.replace(/^PIN=/i, "");

    const userId = Number(pin);

    const timestamp = fields[1]?.trim();

    if (Number.isNaN(userId) || userId <= 0 || !timestamp) {
      console.warn("[ADMS] Invalid attendance record:", line);

      continue;
    }

    /*
     * Validate timestamp without
     * converting timezone.
     *
     * ZKTeco sends local device time.
     */

    const timestampMatch = timestamp.match(
      /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/,
    );

    if (!timestampMatch) {
      console.warn("[ADMS] Invalid timestamp:", timestamp);

      continue;
    }

    const year = Number(timestampMatch[1]);

    /*
     * Ignore the bogus year-2000
     * records we already found.
     */

    if (year < 2020) {
      console.warn("[ADMS] Ignoring invalid old record:", line);

      continue;
    }

    records.push({
      userId,

      timestamp,

      status: nullableNumber(fields[2]),

      verifyType: nullableNumber(fields[3]),

      workCode: fields[4]?.trim() || null,

      rawLine: line,
    });
  }

  return records;
}

/*
|--------------------------------------------------------------------------
| Save one punch
|--------------------------------------------------------------------------
*/

async function saveAdmsPunch(deviceSn: string, record: AdmsAttendance) {
  /*
  |--------------------------------------------------------------------------
  | Save raw ZKTeco metadata
  |--------------------------------------------------------------------------
  */

  await query(
    `
    INSERT INTO
      public.zkteco_adms_punches
    (
      device_sn,
      user_id,
      "timestamp",
      punch_status,
      verify_type,
      work_code,
      raw_line
    )

    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )

    ON CONFLICT (
      device_sn,
      user_id,
      "timestamp"
    )

    DO UPDATE SET

      punch_status =
        EXCLUDED.punch_status,

      verify_type =
        EXCLUDED.verify_type,

      work_code =
        EXCLUDED.work_code,

      raw_line =
        EXCLUDED.raw_line
    `,
    [
      deviceSn,

      record.userId,

      record.timestamp,

      record.status,

      record.verifyType,

      record.workCode,

      record.rawLine,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | Insert normal attendance record
  |--------------------------------------------------------------------------
  |
  | device_uid is obtained from
  | user_accounts.
  |
  */

  const inserted = await query(
    `
      INSERT INTO
        public.attendance_logs
      (
        device_uid,
        user_id,
        "timestamp",
        created_at
      )

      VALUES (
        (
          SELECT
            uid

          FROM
            public.user_accounts

          WHERE
            user_id = $1

          LIMIT 1
        ),

        $1,

        $2,

        CURRENT_TIMESTAMP
      )

      ON CONFLICT (
        user_id,
        "timestamp"
      )

      DO NOTHING

      RETURNING *
      `,
    [record.userId, record.timestamp],
  );

  /*
   * Already saved.
   *
   * Device may retry an HTTP request,
   * so duplicate delivery is expected.
   */

  if (inserted.length === 0) {
    return false;
  }

  const row = {
    ...inserted[0],

    device_sn: deviceSn,

    punch_status: record.status,

    verify_type: record.verifyType,

    work_code: record.workCode,
  };

  console.log("");
  console.log("=================================");

  console.log("REAL-TIME BIOMETRIC PUNCH");

  console.log("=================================");

  console.log(`Device : ${deviceSn}`);

  console.log(`User   : ${record.userId}`);

  console.log(`Time   : ${record.timestamp}`);

  console.log(`Status : ${record.status}`);

  console.log(`Verify : ${record.verifyType}`);

  console.log("=================================");

  /*
   * Send to browser.
   */

  await broadcastNewLog(row);

  return true;
}

/*
|--------------------------------------------------------------------------
| Process ATTLOG upload
|--------------------------------------------------------------------------
*/

export async function processAttendanceUpload(
  deviceSn: string,
  body: string,
  stamp?: string,
) {
  const records = parseAttendanceBody(body);

  let inserted = 0;

  let duplicates = 0;

  for (const record of records) {
    try {
      const wasInserted = await saveAdmsPunch(deviceSn, record);

      if (wasInserted) {
        inserted++;
      } else {
        duplicates++;
      }
    } catch (error) {
      console.error("[ADMS] Attendance insert error:", record, error);
    }
  }

  await updateAttendanceStamp(deviceSn, stamp);

  return {
    received: records.length,

    inserted,

    duplicates,
  };
}
