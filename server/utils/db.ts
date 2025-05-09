// @ts-ignore
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config()

const pool = new Pool ({
  //connectionString: process.env.DATABASE_URL, // Use env variable for security
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function query(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params)
    return result.rows
  } finally { 
    client.release();
  }
}
