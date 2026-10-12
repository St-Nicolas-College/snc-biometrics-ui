import { query } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const params = getQuery(event);

  const dateStart = String(params.date_start ?? "").trim();

  const dateEnd = String(params.date_end ?? "").trim();

  if (!dateStart || !dateEnd) {
    throw createError({
      statusCode: 400,
      statusMessage: "Both date_start and date_end are required.",
    });
  }

  const rows = await query(
    `
    WITH logs_by_day AS (
      SELECT
        al.user_id,
        DATE(al."timestamp") AS log_date,

        MIN(al."timestamp") AS in_time,

        CASE
          WHEN COUNT(*) > 1
            AND MIN(al."timestamp") <> MAX(al."timestamp")
          THEN MAX(al."timestamp")
          ELSE NULL
        END AS out_time,

        COUNT(*) AS entries

      FROM attendance_logs al

      WHERE
        al.user_id > 0

        AND al."timestamp" >=
          TO_DATE(
            $1,
            'DD/MM/YYYY'
          )

        AND al."timestamp" <
          (
            TO_DATE(
              $2,
              'DD/MM/YYYY'
            )
            +
            INTERVAL '1 day'
          )

      GROUP BY
        al.user_id,
        DATE(al."timestamp")
    )

    SELECT
      u.name,
      l.user_id,
      l.log_date,

      l.in_time,
      l.out_time,
      l.entries,

      ws.shift_name,
      ws.shift_start,
      ws.shift_end,
      ws.grace_period_minutes,

      CASE
        WHEN ws.shift_start IS NULL
          THEN NULL

        WHEN l.in_time::time >
          (
            ws.shift_start
            +
            (
              COALESCE(
                ws.grace_period_minutes,
                0
              ) || ' minutes'
            )::interval
          )
          THEN 'Late'

        ELSE 'On Time'
      END AS late_status,

      CASE
        WHEN ws.shift_start IS NULL
          THEN NULL

        WHEN l.in_time::time >
          (
            ws.shift_start
            +
            (
              COALESCE(
                ws.grace_period_minutes,
                0
              ) || ' minutes'
            )::interval
          )

          THEN FLOOR(
            EXTRACT(
              EPOCH FROM (
                l.in_time::time
                -
                ws.shift_start
                -
                (
                  COALESCE(
                    ws.grace_period_minutes,
                    0
                  ) || ' minutes'
                )::interval
              )
            ) / 60
          )

        ELSE 0
      END AS late_minutes,

      CASE
        WHEN l.out_time IS NULL
          THEN NULL

        WHEN ws.shift_end IS NULL
          THEN NULL

        WHEN l.out_time::time <
          ws.shift_end
          THEN 'Left Early'

        ELSE 'OK'
      END AS early_leave_status,

      CASE
        WHEN l.out_time IS NULL
          THEN NULL

        ELSE ROUND(
          (
            EXTRACT(
              EPOCH FROM (
                l.out_time -
                l.in_time
              )
            ) / 3600
          )::numeric,
          2
        )
      END AS total_hours

    FROM logs_by_day l

    JOIN user_accounts u
      ON u.user_id =
         l.user_id

    LEFT JOIN LATERAL (
      SELECT
        st.shift_name,
        st.shift_start,
        st.shift_end,
        st.grace_period_minutes,
        uws.weekday

      FROM
        user_weekday_shifts uws

      JOIN shift_types st
        ON st.id =
           uws.shift_type_id

      WHERE
        uws.user_id =
          l.user_id

        AND uws.weekday =
          EXTRACT(
            DOW FROM
            l.log_date
          )::integer

      ORDER BY
        uws.id DESC

      LIMIT 1

    ) ws ON TRUE

    ORDER BY
      l.log_date DESC,
      l.in_time DESC,
      l.user_id ASC
    `,
    [dateStart, dateEnd],
  );

  return rows;
});
