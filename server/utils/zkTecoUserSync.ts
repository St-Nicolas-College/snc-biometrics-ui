import { query } from "./db";

export interface ZKTecoUser {
  uid: number;
  role: number;
  name: string;
  cardno?: string | number;
  userId: string | number;
}

export async function syncZktecoUsers(users: ZKTecoUser[]) {
  console.log("");
  console.log("=================================");
  console.log("Synchronizing ZKTeco Users");
  console.log("=================================");

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  for (const user of users) {
    try {
      const userId = Number(user.userId);
      if (Number.isNaN(userId)) {
        console.warn("Invalid ZKTeco user ID:", user.userId);
        skipped++;
        continue;
      }
      await query(
        `
        INSERT INTO
          public.user_accounts
        (
          uid,
          role,
          name,
          card_no,
          user_id,
          created_at
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          CURRENT_TIMESTAMP
        )

        ON CONFLICT (
          user_id
        )
        DO UPDATE SET
          uid =
            EXCLUDED.uid,
          role =
            EXCLUDED.role,
          name =
            EXCLUDED.name,
          card_no =
            EXCLUDED.card_no
        `,
        [
          Number(user.uid),
          user.role,
          user.name ?? "",
          user.cardno ?? null,
          userId,
        ],
      );

      processed++;
    } catch (error) {
      errors++;
      console.error("User synchronization error:", user, error);
    }
  }

  /*
   * Real-time logs don't always
   * provide the internal ZKTeco UID.
   *
   * If an attendance record has a
   * null device_uid, fill it using
   * the user_accounts mapping.
   */

  await query(
    `
    UPDATE
      public.attendance_logs AS a
    SET
      device_uid = u.uid
    FROM
      public.user_accounts AS u
    WHERE
      a.user_id = u.user_id
      AND
      a.device_uid IS NULL
    `,
  );

  console.log(`Users processed : ${processed}`);
  console.log(`Users skipped   : ${skipped}`);
  console.log(`Errors          : ${errors}`);
  console.log("=================================");
  console.log("");
}
