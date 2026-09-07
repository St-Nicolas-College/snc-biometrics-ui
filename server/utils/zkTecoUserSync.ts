import { query } from "./db";

export interface ZKTecoUser {
  uid: number;
  role: number;
  name: string;
  cardno?: string | number;
  userId: string | number;
}

export async function syncZktecoUsers(
  users: ZKTecoUser[]
) {
  console.log("");
  console.log("=================================");
  console.log("Starting User Database Sync");
  console.log("=================================");

  console.log(`Users received: ${users.length}`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const {
        uid,
        role,
        name,
        cardno,
        userId,
      } = user;

      if (
        userId === undefined ||
        userId === null ||
        userId === ""
      ) {
        console.warn(
          "Skipping user without userId:",
          user
        );

        skippedCount++;

        continue;
      }

      const numericUserId = Number(userId);

      if (Number.isNaN(numericUserId)) {
        console.warn(
          "Skipping invalid userId:",
          userId
        );

        skippedCount++;

        continue;
      }

      const existing = await query(
        `
        SELECT id
        FROM public.user_accounts
        WHERE user_id = $1
        LIMIT 1
        `,
        [numericUserId]
      );

      await query(
        `
        INSERT INTO public.user_accounts (
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

        ON CONFLICT (user_id)

        DO UPDATE SET
          uid = EXCLUDED.uid,
          role = EXCLUDED.role,
          name = EXCLUDED.name,
          card_no = EXCLUDED.card_no
        `,
        [
          uid,
          role,
          name ?? "",
          cardno ?? null,
          numericUserId,
        ]
      );

      if (existing.length === 0) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    } catch (error) {
      errorCount++;

      console.error(
        "Failed to synchronize user:",
        user
      );

      console.error(error);
    }
  }

  console.log("");
  console.log("User Sync Complete");
  console.log("-------------------------");
  console.log(`Received : ${users.length}`);
  console.log(`Inserted : ${insertedCount}`);
  console.log(`Updated  : ${updatedCount}`);
  console.log(`Skipped  : ${skippedCount}`);
  console.log(`Errors   : ${errorCount}`);
  console.log("-------------------------");
  console.log("");
}