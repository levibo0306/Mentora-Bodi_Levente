import pg from "pg";

// DATE columns (missions, streaks, weekly goals) are calendar days, not instants.
// The default parser turns them into local-midnight Date objects, which shifts the day
// when serialized as UTC; keep them as "YYYY-MM-DD" strings instead.
pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) => value);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // You can uncomment this if you use self-signed/local SSL:
  // ssl: { rejectUnauthorized: false },
});

export async function healthcheck() {
  await pool.query("select 1");
}
