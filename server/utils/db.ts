// @ts-ignore
import { Pool } from 'pg';

const pool = new Pool ({
  connectionString: process.env.DATABASE_URL, // Use env variable for security
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
