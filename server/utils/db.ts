//@ts-ignore
import { Pool, type QueryResultRow } from "pg";

import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function query<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);

  return result.rows;
}

export default pool;
