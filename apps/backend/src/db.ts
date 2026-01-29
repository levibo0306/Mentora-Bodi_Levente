import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // You can uncomment this if you use self-signed/local SSL:
  // ssl: { rejectUnauthorized: false },
});

export async function healthcheck() {
  await pool.query("select 1");
}
