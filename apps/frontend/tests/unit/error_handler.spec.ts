import { describe, test, expect } from "vitest";
import { formatError } from "../../src/core/quizLogic";

describe("error handler", () => {
  test("returns a readable error message", () => {
    expect(formatError({ message: "fail" })).toBe("Hiba történt");
  });
});
