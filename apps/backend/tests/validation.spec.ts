import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { signToken } from "../src/middleware/auth";

const query = vi.fn();
vi.mock("../src/db", () => ({
  pool: { query },
  healthcheck: vi.fn().mockResolvedValue(undefined),
}));

const quizId = "00000000-0000-4000-8000-000000000001";

describe("input validation", () => {
  beforeEach(() => {
    query.mockReset();
    process.env.JWT_SECRET = "validation-test-secret";
  });

  test("rejects a question whose correct answer points outside the options", async () => {
    const { app } = await import("../src/index");
    const token = signToken({ sub: quizId, email: "teacher@example.com", role: "teacher" });
    const client = request(app);
    const headers = { Authorization: `Bearer ${token}` };

    await client.post(`/api/quizzes/${quizId}/questions`).set(headers)
      .send({ prompt: "Kérdés?", options: ["A", "B"], correct_index: 2 }).expect(400);
    await client.post(`/api/quizzes/${quizId}/questions`).set(headers)
      .send({ prompt: "Kérdés?", options: ["A", "  "], correct_index: 0 }).expect(400);
    expect(query).not.toHaveBeenCalled();
  });

  test("does not expose database details when a username is already taken", async () => {
    const { app } = await import("../src/index");
    query.mockRejectedValueOnce(Object.assign(new Error('duplicate key value violates unique constraint "users_username_key"'), { code: "23505" }));
    const response = await request(app).post("/api/auth/register")
      .send({ username: "mentora_tanar", email: "uj@example.com", password: "Mentora123!", role: "student" });

    expect(response.status).toBe(409);
    expect(JSON.stringify(response.body)).not.toContain("constraint");
  });
});
