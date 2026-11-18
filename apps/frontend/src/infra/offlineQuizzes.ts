import type { Quiz, QuizQuestion, QuizSubmission } from "../api/quizzes";

export type OfflineQuiz = {
  quiz: Quiz;
  questions: QuizQuestion[];
  downloadedAt: string;
};

type PendingAttempt = {
  id: string;
  quizId: string;
  answers: QuizSubmission;
  createdAt: string;
};

const currentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("mentora_user") ?? "null")?.id ?? "guest";
  } catch {
    return "guest";
  }
};

const quizKey = () => `mentora_offline_quizzes:${currentUserId()}`;
const queueKey = () => `mentora_pending_attempts:${currentUserId()}`;

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
};

export const listOfflineQuizzes = () => read<OfflineQuiz[]>(quizKey(), []);

export const getOfflineQuiz = (quizId: string) =>
  listOfflineQuizzes().find((item) => item.quiz.id === quizId) ?? null;

export const saveOfflineQuiz = (quiz: Quiz, questions: QuizQuestion[]) => {
  const remaining = listOfflineQuizzes().filter((item) => item.quiz.id !== quiz.id);
  localStorage.setItem(quizKey(), JSON.stringify([
    { quiz, questions, downloadedAt: new Date().toISOString() },
    ...remaining,
  ]));
};

export const removeOfflineQuiz = (quizId: string) => {
  localStorage.setItem(
    quizKey(),
    JSON.stringify(listOfflineQuizzes().filter((item) => item.quiz.id !== quizId))
  );
};

export const queueOfflineAttempt = (quizId: string, answers: QuizSubmission) => {
  const pending = read<PendingAttempt[]>(queueKey(), []);
  pending.push({
    id: `${quizId}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    quizId,
    answers,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(queueKey(), JSON.stringify(pending));
};

// 4xx answers (except auth/timeout/rate limit) will never succeed on retry, e.g. a deleted quiz.
export const isPermanentSyncError = (error: unknown) => {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500 && ![401, 408, 429].includes(status);
};

let attemptSync: Promise<number> | null = null;

export function syncOfflineAttempts(
  submit: (quizId: string, answers: QuizSubmission) => Promise<unknown>
) {
  // The "load" and "online" events can overlap; a second run would submit the same items twice.
  attemptSync ??= runAttemptSync(submit).finally(() => { attemptSync = null; });
  return attemptSync;
}

async function runAttemptSync(submit: (quizId: string, answers: QuizSubmission) => Promise<unknown>) {
  if (!navigator.onLine) return 0;
  const key = queueKey();
  const pending = read<PendingAttempt[]>(key, []);
  const done = new Set<string>();
  let synced = 0;

  for (const attempt of pending) {
    try {
      await submit(attempt.quizId, attempt.answers);
      done.add(attempt.id);
      synced += 1;
    } catch (error) {
      if (isPermanentSyncError(error)) done.add(attempt.id);
    }
  }
  // Re-read so that attempts queued during the sync are kept.
  localStorage.setItem(key, JSON.stringify(read<PendingAttempt[]>(key, []).filter((item) => !done.has(item.id))));
  return synced;
}
