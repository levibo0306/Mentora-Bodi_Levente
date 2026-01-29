import { describe, test, expect } from "vitest";
import { createQuiz } from "../../src/core/quizLogic";

describe("quizLogic", () => {
  test("returns error when title is empty", () => {
    const result = createQuiz("");
    expect(result.error).toBe("A cím kötelező");
  });
});
