import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { signToken, requireAuth } from "../middleware/auth";
import { revokeToken } from "../revokedTokens";

export const authRouter = Router();

// --- REGISTER ---
const RegisterBody = z.object({
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_.]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["teacher", "student"]),
});

authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = RegisterBody.parse(req.body);
    const password_hash = await bcrypt.hash(password, 12);

    const r = await pool.query(
      "insert into users(username,email,password_hash,role) values($1,$2,$3,$4) returning id,username,email,role",
      [username.trim().toLowerCase(), email.toLowerCase(), password_hash, role]
    );

    const user = r.rows[0];
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(400).json({ error: err.message || "Registration failed" });
  }
});

// --- LOGIN ---
const LoginBody = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  try {
    const { identifier, password } = LoginBody.parse(req.body);
    const id = identifier.trim().toLowerCase();

    const r = await pool.query(
      "select id,username,email,role,password_hash from users where email=$1 or username=$1",
      [id]
    );
    
    if (r.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const u = r.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ sub: u.id, email: u.email, role: u.role });
    res.json({ token, user: { id: u.id, username: u.username, email: u.email, role: u.role } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// --- ME (User info) ---
// ✅ JAVÍTVA: req.user használata req.auth helyett
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user; // ← Ez a javítás!
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Opcionálisan: friss adat DB-ből
    const r = await pool.query(
      "select id, username, email, role, xp from users where id=$1",
      [user.sub]
    );

    if (r.rowCount === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const u = r.rows[0];
    res.json({ 
      user: { 
        id: u.id, 
        username: u.username,
        email: u.email, 
        role: u.role,
        xp: u.xp || 0
      } 
    });
  } catch (err: any) {
    console.error("Me endpoint error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const UpdateProfileBody = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_.]+$/),
  email: z.string().trim().email(),
  current_password: z.string().min(1),
  new_password: z.string().min(6).max(72).optional(),
});

authRouter.patch("/me", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const body = UpdateProfileBody.parse(req.body);
    const current = await pool.query(
      "SELECT id, username, email, role, password_hash FROM users WHERE id=$1",
      [userId]
    );
    if (current.rowCount === 0) return res.status(404).json({ error: "A felhasználó nem található." });

    const validPassword = await bcrypt.compare(body.current_password, current.rows[0].password_hash);
    if (!validPassword) return res.status(400).json({ error: "A jelenlegi jelszó hibás." });

    const passwordHash = body.new_password
      ? await bcrypt.hash(body.new_password, 12)
      : current.rows[0].password_hash;
    const updated = await pool.query(
      `UPDATE users
       SET username=$1, email=$2, password_hash=$3
       WHERE id=$4
       RETURNING id, username, email, role`,
      [body.username.toLowerCase(), body.email.toLowerCase(), passwordHash, userId]
    );
    const user = updated.rows[0];
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Ez a felhasználónév vagy email cím már foglalt." });
    }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Ellenőrizd a megadott fiókadatokat." });
    }
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Nem sikerült módosítani a profilt." });
  }
});

// --- LOGOUT ---
authRouter.post("/logout", requireAuth, async (req, res) => {
  try {
    const token = (req as any).token as string;
    revokeToken(token);
    return res.status(204).send();
  } catch (err: any) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default authRouter;
