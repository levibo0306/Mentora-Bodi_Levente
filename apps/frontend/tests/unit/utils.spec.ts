import { describe, test, expect } from "vitest";
import { formatTitle } from "../../src/core/quizLogic";

describe("utils", () => {
  test("should format title", () => {
    expect(formatTitle("abc")).toBe("ABC");
  });
});
