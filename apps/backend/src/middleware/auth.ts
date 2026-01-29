import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../revokedTokens";

export type JwtPayload = { sub: string; email: string; role: "teacher" | "student" };

// EZ HIÁNYZOTT: Token létrehozása (aláírása)
export function signToken(payload: JwtPayload) {
  // 24 órás lejárattal készítjük a tokent
  return jwt.sign(payload, process.env.JWT_SECRET || "titkos-kulcs", { expiresIn: "24h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  if (isTokenRevoked(token)) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "titkos-kulcs") as JwtPayload;
    (req as any).auth = payload;
    (req as any).token = token;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}