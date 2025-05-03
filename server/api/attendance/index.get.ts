// @ts-ignore
import { query } from '~/server/utils/db';

export default defineEventHandler(async () => {
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
      TRIM(TO_CHAR(l.log_date, 'Day')) AS day,
      TO_CHAR(l.log_date, 'DD/MM/YYYY') || ' ' || TRIM(TO_CHAR(l.log_date, 'Day')) AS formatted_date
    FROM logs_by_day l
    JOIN user_accounts u ON u.user_id = l.user_id
    ORDER BY log_date DESC, in_time DESC
  `)
  
  return rows;
});
