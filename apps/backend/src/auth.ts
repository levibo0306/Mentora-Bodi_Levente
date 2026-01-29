import jwt from "jsonwebtoken";
import { z } from "zod";

const JwtPayload = z.object({
  sub: z.string(), // userId
  role: z.enum(["teacher", "student"]),
  email: z.string().email()
});

export type AuthUser = z.infer<typeof JwtPayload>;

export function signToken(user: AuthUser) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export function requireAuth(req: any, res: any, next: any) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET missing");

    const decoded = jwt.verify(token, secret);
    const user = JwtPayload.parse(decoded);

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(role: "teacher" | "student") {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
