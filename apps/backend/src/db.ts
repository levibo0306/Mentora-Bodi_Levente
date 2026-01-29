console.log("[db] DATABASE_URL typeof:", typeof process.env.DATABASE_URL);
console.log("[db] DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("[db] DATABASE_URL preview:", (process.env.DATABASE_URL ?? "").slice(0, 60));
console.log("[db] PG_PASSWORD typeof:", typeof process.env.PG_PASSWORD);
console.log("[db] PG_PASSWORD value:", process.env.PG_PASSWORD);
import pg from "pg";
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, });

export async function healthcheck() {
  await pool.query("select 1");
}
