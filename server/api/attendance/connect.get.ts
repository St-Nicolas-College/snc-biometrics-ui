// @ts-ignore
import { query } from '~/server/utils/db';

export default defineEventHandler(async () => {
  const { rows } = await query(`
    SELECT device_uid, user_id, timestamp
    FROM attendance_logs
    ORDER BY timestamp DESC
    LIMIT 100
  `);
  
  return rows;
});
