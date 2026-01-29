import { describe, test, expect } from "vitest";
import { validateQuizForm } from "../../src/core/quizLogic";

describe("form validation", () => {
  test("invalid if title missing", () => {
    expect(validateQuizForm({ title: "" })).toBe(false);
  });
});
