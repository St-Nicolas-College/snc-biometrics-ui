import { query } from "~/server/utils/db";
export default defineEventHandler(async (event) => {
  const rows = await query(`
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
      dl.in_time,

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
  ),

  cutoff_attendance AS (
    SELECT
      user_id,
      late_minutes,

      CASE
        WHEN EXTRACT(DAY FROM log_date) <= 15
        THEN DATE_TRUNC('month', log_date)
        ELSE DATE_TRUNC('month', log_date) + INTERVAL '15 days'
      END AS cutoff_start

    FROM attendance
  )

  SELECT
    user_id,
    cutoff_start,
    SUM(late_minutes) AS late_minutes,
    CONCAT(
      FLOOR(SUM(late_minutes)/60), 'h ',
      MOD(SUM(late_minutes),60), 'm'
    ) AS late_time

  FROM cutoff_attendance
  GROUP BY user_id, cutoff_start
  ORDER BY cutoff_start DESC;
  
    `);

  return rows;
});
