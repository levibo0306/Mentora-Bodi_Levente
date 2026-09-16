import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { isTokenRevoked } from "../revokedTokens";

const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["teacher", "student"]),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  return secret;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "24h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  if (isTokenRevoked(token)) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = JwtPayloadSchema.parse(jwt.verify(token, jwtSecret()));
    (req as any).user = payload; 
    (req as any).token = token;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  if (isTokenRevoked(token)) return next();

  try {
    const payload = JwtPayloadSchema.parse(jwt.verify(token, jwtSecret()));
    (req as any).user = payload;
    (req as any).token = token;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function requireRole(role: "teacher" | "student") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
