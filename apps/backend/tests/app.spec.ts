import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { signToken } from "../src/middleware/auth";

const query = vi.fn();
vi.mock("../src/db", () => ({
  pool: { query },
  healthcheck: vi.fn().mockResolvedValue(undefined),
}));

describe("backend application", () => {
  beforeEach(() => {
    query.mockReset();
    process.env.JWT_SECRET = "app-test-secret";
  });

  test("serves the health endpoint", async () => {
    const { app } = await import("../src/index");
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test("protects adaptive questions from anonymous access", async () => {
    const { app } = await import("../src/index");
    const response = await request(app).get("/api/quizzes/00000000-0000-4000-8000-000000000001/adaptive-questions");
    expect(response.status).toBe(401);
  });

  test("validates AI generation input before calling the model", async () => {
    const { app } = await import("../src/index");
    const token = signToken({
      sub: "00000000-0000-4000-8000-000000000001",
      email: "student@example.com",
      role: "student",
    });
    const response = await request(app)
      .post("/api/quizzes/generate-ai")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "túl rövid", count: 5 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "A tananyag vagy a kérdésszám hibás." });
    expect(query).not.toHaveBeenCalled();
  });
});
