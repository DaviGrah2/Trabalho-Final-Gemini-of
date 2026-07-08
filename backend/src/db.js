import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "senai",
    database: "schema",
    port: 5433
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initDb() {
  const schema = await import('fs').then(fs => fs.promises.readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'));
  await pool.query(schema);
  // ensure avatar_url column exists for student profiles
  try {
    await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT");
  } catch (err) {
    console.warn('Could not ensure avatar_url column:', err.message || err);
  }
}
