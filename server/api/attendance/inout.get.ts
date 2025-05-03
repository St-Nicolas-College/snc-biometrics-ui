import { query } from "~/server/utils/db";

export default defineEventHandler(async () => {
  // const rows = await query(`
  //   WITH logs_by_day AS (
  //     SELECT
  //       al.user_id,
  //       DATE(al.timestamp) AS log_date,
  //       MIN(al.timestamp) AS in_time,
  //       MAX(al.timestamp) AS out_time,
  //       COUNT(*) AS entries
  //     FROM attendance_logs al
  //     GROUP BY al.user_id, DATE(al.timestamp)
  //   )
  //   SELECT
  //     u.name,
  //     l.user_id,
  //     l.log_date,
  //     l.in_time,
  //     l.out_time,
  //     CASE
  //       WHEN l.in_time = l.out_time THEN 'IN ONLY'
  //       ELSE 'IN/OUT'
  //     END AS status,
  //     ROUND(EXTRACT(EPOCH FROM l.out_time - l.in_time) / 3600, 2) AS total_hours
  //   FROM logs_by_day l
  //   JOIN users u ON u.user_id = l.user_id
  //   ORDER BY l.log_date DESC, l.user_id
  // `)

  const rows = await query(`
    WITH logs_by_day AS (
      SELECT
        al.user_id,
        DATE(al.timestamp) AS log_date,
        MIN(al.timestamp) AS in_time,
        MAX(al.timestamp) AS out_time,
        COUNT(*) AS entries
      FROM attendance_logs al
      GROUP BY al.user_id, DATE(al.timestamp)
    )
    SELECT
      u.name,
      l.user_id,
      l.log_date,
      l.in_time,
      l.out_time,
      CASE 
        WHEN l.in_time = l.out_time THEN 'IN ONLY'
        ELSE 'IN/OUT'
      END AS status,
      ROUND(EXTRACT(EPOCH FROM l.out_time - l.in_time) / 3600, 2) AS total_hours,
      CASE
        WHEN l.in_time::time > TIME '08:36:00' THEN TRUE
        ELSE FALSE
      END AS is_late,

      CASE
        WHEN l.out_time::time < TIME '16:45:00' THEN TRUE
        ELSE FALSE
      END AS is_early_leave,

      (s.shift_start + (s.grace_minutes || ' minutes')::interval)::time AS allowed_in,

      CASE 
        WHEN l.in_time::time > (s.shift_start + (s.grace_minutes || ' minutes')::interval)::time THEN
          EXTRACT(MINUTE FROM (l.in_time - (l.log_date + s.shift_start + (s.grace_minutes || ' minutes')::interval)))
        ELSE 0
      END AS late_minutes

    FROM logs_by_day l
    JOIN user_accounts u ON u.user_id = l.user_id
    JOIN shifts s ON s.user_id = u.user_id
    ORDER BY l.log_date DESC, l.user_id
  `);

  return rows;
});
