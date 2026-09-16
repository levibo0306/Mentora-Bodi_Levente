import { describe, expect, test } from "vitest";
import { estimateTargetDifficulty, rankAdaptiveQuestions } from "../src/services/adaptive";

describe("adaptive question selection", () => {
  test("maps recent performance to a suitable difficulty", () => {
    expect(estimateTargetDifficulty(0)).toBe(1);
    expect(estimateTargetDifficulty(50)).toBe(3);
    expect(estimateTargetDifficulty(100)).toBe(5);
  });

  test("clamps invalid performance values to the supported range", () => {
    expect(estimateTargetDifficulty(-25)).toBe(1);
    expect(estimateTargetDifficulty(125)).toBe(5);
    expect(estimateTargetDifficulty(undefined)).toBe(3);
  });

  test("prioritizes unseen and weak questions near the learner ability", () => {
    const selected = rankAdaptiveQuestions([
      { question: "mastered", questionId: "a", difficulty: 3, attempts: 8, correctCount: 8 },
      { question: "weak", questionId: "b", difficulty: 3, attempts: 5, correctCount: 1 },
      { question: "unseen", questionId: "c", difficulty: 3, attempts: 0, correctCount: 0 },
      { question: "too-hard", questionId: "d", difficulty: 5, attempts: 2, correctCount: 1 },
    ], 50, 2);

    expect(selected).toEqual(["unseen", "weak"]);
  });

  test("caps a requested question set at twenty items", () => {
    const candidates = Array.from({ length: 30 }, (_, index) => ({
      question: index,
      questionId: String(index).padStart(2, "0"),
      difficulty: 3,
      attempts: 0,
      correctCount: 0,
    }));
    expect(rankAdaptiveQuestions(candidates, 50, 99)).toHaveLength(20);
  });

  test("keeps at least one question when the requested limit is zero", () => {
    const candidates = [
      { question: "first", questionId: "a", difficulty: 3, attempts: 0, correctCount: 0 },
      { question: "second", questionId: "b", difficulty: 3, attempts: 0, correctCount: 0 },
    ];

    expect(rankAdaptiveQuestions(candidates, 50, 0)).toHaveLength(1);
  });
});
