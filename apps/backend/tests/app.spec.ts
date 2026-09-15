import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";

const query = vi.fn();
vi.mock("../src/db", () => ({
  pool: { query },
  healthcheck: vi.fn().mockResolvedValue(undefined),
}));

describe("backend application", () => {
  beforeEach(() => query.mockReset());

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
});

