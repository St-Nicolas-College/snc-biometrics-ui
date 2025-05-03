// @ts-ignore
import ZKLib from "node-zklib";
import { query } from "./db";
import { broadcastNewLog } from "../api/attendance/stream.get";

const deviceIP = process.env.ZKTECO_IP;
const devicePort = process.env.ZKTECO_PORT;
const pollingInterval = 60 * 1000; // every minute

export async function startZktecoUserSync() {
  const zk = new ZKLib(deviceIP, devicePort, 10000);

  try {
    await zk.createSocket();

    console.log("Connected to ZKTeco device");


    setInterval(async () => {
      console.log("Polling device...");
      try {

        const user_data = await zk.getUsers();

        for (const user of user_data.data) {
          const { uid, role, name, cardno, userId } = user;
          // Check if already exist based on userId
          const user_existing = await query(
            "SELECT id FROM user_accounts WHERE uid = $1",
            [uid]
          );

          if (user_existing.length === 0) {
            const inserted = await query(
              `INSERT INTO user_accounts (uid, role, name, card_no, user_id, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
              [uid, role, name, cardno, userId]
            );

            // Broadcast new log
            await broadcastNewLog(inserted[0]);
          }
        }

        

        console.log(`Synced ${user_data.data.length} logs.`);
      } catch (pollError) {
        console.error("Polling error:", pollError);
      }
    }, pollingInterval);
  } catch (err) {
    console.error("Failed to connect to ZKTeco:", err);
  }
}
