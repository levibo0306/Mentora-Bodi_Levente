export type AdaptiveQuestionCandidate<T = unknown> = {
  question: T;
  questionId: string;
  difficulty: number | null;
  attempts: number;
  correctCount: number;
};

export function estimateTargetDifficulty(recentAverageScore: number | null | undefined) {
  const score = Math.min(100, Math.max(0, Number(recentAverageScore ?? 50)));
  return Math.min(5, Math.max(1, 1 + Math.round(score / 25)));
}

export function rankAdaptiveQuestions<T>(
  candidates: AdaptiveQuestionCandidate<T>[],
  recentAverageScore: number | null | undefined,
  limit = 10,
) {
  const targetDifficulty = estimateTargetDifficulty(recentAverageScore);
  const safeLimit = Math.min(20, Math.max(1, Math.trunc(limit)));

  return candidates
    .map((candidate) => {
      const attempts = Math.max(0, Number(candidate.attempts || 0));
      const mastery = attempts > 0
        ? Math.min(1, Math.max(0, Number(candidate.correctCount || 0) / attempts))
        : 0.5;
      const difficulty = Math.min(5, Math.max(1, Number(candidate.difficulty ?? 3)));
      const weakness = 1 - mastery;
      const difficultyMatch = 1 - Math.abs(difficulty - targetDifficulty) / 4;
      const explorationBonus = attempts === 0 ? 0.35 : 0;
      const priority = weakness * 0.6 + difficultyMatch * 0.25 + explorationBonus;
      return { ...candidate, priority };
    })
    .sort((left, right) => right.priority - left.priority || left.questionId.localeCompare(right.questionId))
    .slice(0, safeLimit)
    .map(({ question }) => question);
}

