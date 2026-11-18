import { beforeEach, expect, test, vi } from "vitest";

const query = vi.fn();
vi.mock("../src/db", () => ({ pool: { query } }));

beforeEach(() => query.mockReset());

test("continues the learning streak when the last active day was yesterday", async () => {
  const { updateStreakOnAttempt } = await import("../src/services/gamification");
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  query.mockResolvedValueOnce({ rowCount: 1, rows: [{ current_streak: 2, last_active_date: yesterday }] });
  query.mockResolvedValueOnce({ rowCount: 1, rows: [] });

  await expect(updateStreakOnAttempt("user-1", 0)).resolves.toBe(3);
  expect(query.mock.calls[0][0]).toContain("to_char(last_active_date");
});
