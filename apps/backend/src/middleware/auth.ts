import jwt from "jsonwebtoken";
import { z } from "zod";

const JwtPayloadSchema = z.object({
  sub: z.string(), // user id (uuid)
  email: z.string().email(),
  role: z.enum(["teacher", "student"]),
});

export type AuthUser = z.infer<typeof JwtPayloadSchema>;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return secret;
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, getSecret(), { expiresIn: "7d" });
}

export function requireAuth(req: any, res: any, next: any) {
  try {
    const h = req.headers.authorization ?? "";
    const token = typeof h === "string" && h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, getSecret());
    req.user = JwtPayloadSchema.parse(decoded);
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(role: "teacher" | "student") {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
