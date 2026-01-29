import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { signToken } from "../middleware/auth";

export const authRouter = Router();

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["teacher", "student"]),
});

authRouter.post("/register", async (req, res) => {
  const { email, password, role } = RegisterBody.parse(req.body);
  const password_hash = await bcrypt.hash(password, 12);

  const r = await pool.query(
    "insert into users(email,password_hash,role) values($1,$2,$3) returning id,email,role",
    [email.toLowerCase(), password_hash, role]
  );

  const user = r.rows[0];
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user });
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = LoginBody.parse(req.body);

  const r = await pool.query(
    "select id,email,role,password_hash from users where email=$1",
    [email.toLowerCase()]
  );
  if (r.rowCount === 0) return res.status(401).json({ error: "Invalid credentials" });

  const u = r.rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: u.id, email: u.email, role: u.role });
  res.json({ token, user: { id: u.id, email: u.email, role: u.role } });
});
