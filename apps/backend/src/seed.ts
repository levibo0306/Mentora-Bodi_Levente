import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "./db";

const testUsers = [
  {
    username: "mentora_diak",
    email: "diak@mentora.local",
    password: "Mentora123!",
    role: "student",
  },
  {
    username: "mentora_tanar",
    email: "tanar@mentora.local",
    password: "Mentora123!",
    role: "teacher",
  },
] as const;

async function seed() {
  for (const user of testUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await pool.query(
      `insert into users (username, email, password_hash, role)
       values ($1, $2, $3, $4)
       on conflict (email) do update
       set username = excluded.username,
           password_hash = excluded.password_hash,
           role = excluded.role`,
      [user.username, user.email, passwordHash, user.role]
    );
  }

  console.log("Tesztfiokok letrehozva:");
  for (const user of testUsers) {
    console.log(`- ${user.role}: ${user.email} / ${user.password}`);
  }
}

seed()
  .catch((error) => {
    console.error("A seedeles sikertelen:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
