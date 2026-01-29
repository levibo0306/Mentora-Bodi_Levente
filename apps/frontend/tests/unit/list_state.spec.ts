import { describe, test, expect } from "vitest";
import { isEmptyState } from "../../src/core/quizLogic";

describe("list state", () => {
  test("empty array triggers empty UI state", () => {
    expect(isEmptyState([])).toBe(true);
  });
});
