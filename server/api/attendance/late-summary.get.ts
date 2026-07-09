import { query } from "~/server/utils/db";

export default defineEventHandler(async (event) => {

  const date_query: any = getQuery(event);

  const start = date_query.start;
  const end = date_query.end;

  const rows = await query(
    `
    WITH daily_logs AS (
      SELECT
        user_id,
        DATE(timestamp) AS log_date,
        MIN(timestamp) AS in_time
      FROM attendance_logs
      GROUP BY user_id, DATE(timestamp)
    ),

    shift_data AS (
      SELECT
        uws.user_id,
        uws.weekday,
        st.shift_start,
        st.grace_period_minutes
      FROM user_weekday_shifts uws
      JOIN shift_types st
        ON st.id = uws.shift_type_id
    ),

    attendance AS (
      SELECT
        dl.user_id,
        dl.log_date,
        CASE
          WHEN dl.in_time::time >
            (sd.shift_start + (sd.grace_period_minutes || ' minutes')::interval)
          THEN FLOOR(
            EXTRACT(EPOCH FROM (
              dl.in_time::time
              - sd.shift_start
              - (sd.grace_period_minutes || ' minutes')::interval
            )) / 60
          )
          ELSE 0
        END AS late_minutes
      FROM daily_logs dl
      JOIN shift_data sd
        ON sd.user_id = dl.user_id
       AND sd.weekday = EXTRACT(DOW FROM dl.log_date)
    )

    SELECT
      u.user_id AS user_id,
      u.name AS employee_name,
      TO_CHAR($1::date, 'YYYY-MM-DD') AS cutoff_start,
      TO_CHAR($2::date, 'YYYY-MM-DD') AS cutoff_end,
      SUM(late_minutes) AS late_minutes,
      CONCAT(
        FLOOR(SUM(late_minutes)/60),'h ',
        MOD(SUM(late_minutes),60),'m'
      ) AS late_time
    FROM attendance a
    JOIN user_accounts u 
      ON u.user_id = a.user_id
    WHERE log_date BETWEEN $1 AND $2
    GROUP BY u.user_id, u.name
    ORDER BY u.user_id
    `,
    [start, end] // ✅ pass parameters
  );

  return {
    success: true,
    count: rows.length,
    cutoff: `${start} to ${end}`,
    data: rows,
  }; // ✅ correct variable
});