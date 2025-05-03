// @ts-ignore
import ZKLib from "node-zklib";
import { query } from "./db";
import { broadcastNewLog } from "../api/attendance/stream.get";

const deviceIP = process.env.ZKTECO_IP;
const devicePort = process.env.ZKTECO_PORT;
const pollingInterval = 60 * 1000; // every minute

export async function startZktecoSync() {
  const zk = new ZKLib(deviceIP, devicePort, 10000);

  try {
    await zk.createSocket();

    console.log("Connected to ZKTeco device");
    setInterval(async () => {
      console.log("Polling device...");

      try {
        const attendance = await zk.getAttendances();
       
        for (const log of attendance.data) {
          const { userSn, deviceUserId, recordTime } = log;

          // Check if already exists (based on device_uid)
          const existing = await query(
            "SELECT id FROM attendance_logs WHERE device_uid = $1",
            [userSn]
          );

          if (existing.length === 0) {
            // await query(
            //   `INSERT INTO attendance_logs (device_uid, user_id, timestamp) VALUES ($1, $2, $3)`,
            //   [userSn, deviceUserId, recordTime]
            // );
            const inserted = await query(
              `INSERT INTO attendance_logs (device_uid, user_id, timestamp, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
              [userSn, deviceUserId, recordTime]
            );

            // Broadcast new log
            await broadcastNewLog(inserted[0]);
          }
        }

        console.log(`Synced ${attendance.data.length} logs.`);
      } catch (pollError) {
        console.error("Polling error:", pollError);
      }
    }, pollingInterval);
  } catch (err) {
    console.error("Failed to connect to ZKTeco:", err);
  }
}
