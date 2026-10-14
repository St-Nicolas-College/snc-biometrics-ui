import {
  query
} from '~/server/utils/db'

export default defineEventHandler(
  async () => {
    const rows =
      await query(`
        WITH valid_logs AS (
          SELECT
            al.user_id,
            al."timestamp"

          FROM
            public.attendance_logs al

          WHERE
            al.user_id > 0

            AND
            al."timestamp" >=
              '2020-01-01'
        ),

        /*
        |--------------------------------------------------------------------------
        | Group Attendance By Employee + Local Attendance Date
        |--------------------------------------------------------------------------
        */

        logs_by_day AS (
          SELECT
            user_id,

            "timestamp"::date
              AS log_date,

            MIN(
              "timestamp"
            ) AS in_time,

            MAX(
              "timestamp"
            ) AS max_time,

            COUNT(*)
              AS entries

          FROM
            valid_logs

          GROUP BY
            user_id,
            "timestamp"::date
        ),

        /*
        |--------------------------------------------------------------------------
        | Latest Punch Per Employee + Day
        |--------------------------------------------------------------------------
        */

        latest_punch AS (
          SELECT DISTINCT ON (
            user_id,
            "timestamp"::date
          )

            user_id,

            "timestamp"::date
              AS log_date,

            "timestamp"
              AS last_punch

          FROM
            valid_logs

          ORDER BY
            user_id,

            "timestamp"::date,

            "timestamp" DESC
        )

        SELECT
          l.user_id,

          COALESCE(
            u.name,
            'UNKNOWN USER'
          ) AS name,

          /*
          |--------------------------------------------------------------------------
          | IMPORTANT:
          | Return date as TEXT instead of PostgreSQL DATE
          |--------------------------------------------------------------------------
          |
          | This prevents Node/Nitro from converting:
          |
          |   2026-10-14
          |
          | into:
          |
          |   2026-10-13T16:00:00.000Z
          |
          | The frontend will receive exactly:
          |
          |   "2026-10-14"
          |
          */

          TO_CHAR(
            l.log_date,
            'YYYY-MM-DD'
          ) AS log_date,

          l.in_time,

          /*
          |--------------------------------------------------------------------------
          | Time Out
          |--------------------------------------------------------------------------
          |
          | Actual ADMS punch status:
          |
          | 0 = IN
          | 1 = OUT
          | 2 = BREAK OUT
          | 3 = BREAK IN
          | 4 = OT IN
          | 5 = OT OUT
          |
          */

          CASE

            WHEN p.punch_status
              IN (0, 3, 4)
              THEN NULL

            WHEN p.punch_status
              IN (1, 2, 5)
              THEN l.max_time

            /*
             * Historical TCP logs don't
             * contain ADMS punch status.
             */

            WHEN l.entries = 1
              THEN NULL

            ELSE
              l.max_time

          END AS out_time,

          lp.last_punch,

          l.entries,

          p.punch_status,

          p.verify_type,

          /*
          |--------------------------------------------------------------------------
          | Current Attendance Status
          |--------------------------------------------------------------------------
          */

          CASE
            p.punch_status

            WHEN 0
              THEN 'CLOCKED IN'

            WHEN 1
              THEN 'CLOCKED OUT'

            WHEN 2
              THEN 'BREAK OUT'

            WHEN 3
              THEN 'BREAK IN'

            WHEN 4
              THEN 'OT IN'

            WHEN 5
              THEN 'OT OUT'

            /*
             * Historical TCP records
             * don't have ADMS metadata.
             *
             * One punch = currently in
             * More than one = clocked out
             */

            ELSE
              CASE

                WHEN l.entries = 1
                  THEN 'CLOCKED IN'

                ELSE
                  'CLOCKED OUT'

              END

          END AS status,

          /*
          |--------------------------------------------------------------------------
          | Total Hours
          |--------------------------------------------------------------------------
          */

          CASE

            /*
             * User is currently inside.
             */
            WHEN p.punch_status
              IN (0, 3, 4)
              THEN NULL

            /*
             * Only one historical punch.
             */
            WHEN l.entries = 1
              THEN NULL

            ELSE
              ROUND(
                (
                  EXTRACT(
                    EPOCH FROM
                    (
                      l.max_time -
                      l.in_time
                    )
                  ) / 3600
                )::numeric,
                2
              )

          END AS total_hours,

          /*
          |--------------------------------------------------------------------------
          | Weekday
          |--------------------------------------------------------------------------
          |
          | FMDay removes the trailing spaces
          | PostgreSQL normally adds to Day.
          |
          */

          TO_CHAR(
            l.log_date,
            'FMDay'
          ) AS day

        FROM
          logs_by_day l

        /*
        |--------------------------------------------------------------------------
        | Latest Punch
        |--------------------------------------------------------------------------
        */

        JOIN
          latest_punch lp

          ON
            lp.user_id =
              l.user_id

            AND
            lp.log_date =
              l.log_date

        /*
        |--------------------------------------------------------------------------
        | User Account
        |--------------------------------------------------------------------------
        */

        LEFT JOIN
          public.user_accounts u

          ON
            u.user_id =
              l.user_id

        /*
        |--------------------------------------------------------------------------
        | ADMS Punch Metadata
        |--------------------------------------------------------------------------
        */

        LEFT JOIN
          public.zkteco_adms_punches p

          ON
            p.user_id =
              lp.user_id

            AND
            p."timestamp" =
              lp.last_punch

        /*
        |--------------------------------------------------------------------------
        | Latest Activity First
        |--------------------------------------------------------------------------
        */

        ORDER BY
          lp.last_punch DESC
      `)

    return rows
  }
)