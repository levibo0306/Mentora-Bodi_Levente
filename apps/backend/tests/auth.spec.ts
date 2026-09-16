import jwt from "jsonwebtoken";
import { afterEach, describe, expect, test, vi } from "vitest";
import { requireAuth, signToken } from "../src/middleware/auth";

const user = {
  sub: "00000000-0000-4000-8000-000000000001",
  email: "student@example.com",
  role: "student" as const,
};

afterEach(() => {
  delete process.env.JWT_SECRET;
});

describe("authentication middleware", () => {
  test("refuses to sign tokens without a configured secret", () => {
    expect(() => signToken(user)).toThrow("JWT_SECRET missing");
  });

  test("accepts a valid token and exposes its validated claims", () => {
    process.env.JWT_SECRET = "test-secret";
    const token = signToken(user);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const next = vi.fn();

    requireAuth(req, { status, json } as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual(user);
    expect(status).not.toHaveBeenCalled();
  });

  test("rejects signed tokens with unsupported claims", () => {
    process.env.JWT_SECRET = "test-secret";
    const token = jwt.sign({ ...user, role: "admin" }, process.env.JWT_SECRET);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    requireAuth(req, { status } as any, vi.fn());

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });
});
