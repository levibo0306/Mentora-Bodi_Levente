import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  getOfflineQuiz,
  listOfflineQuizzes,
  queueOfflineAttempt,
  removeOfflineQuiz,
  saveOfflineQuiz,
  syncOfflineAttempts,
} from "../../src/infra/offlineQuizzes";

const quiz = {
  id: "quiz-1",
  title: "Tesztkvíz",
  mode: "practice" as const,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const questions = [{
  id: "question-1",
  prompt: "Kérdés?",
  options: ["A", "B"],
  correct_index: 0,
}];

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

describe("offline quizzes", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
    localStorage.setItem("mentora_user", JSON.stringify({ id: "student-1" }));
    vi.stubGlobal("navigator", { onLine: true });
  });

  test("stores, replaces and removes a downloaded quiz", () => {
    saveOfflineQuiz(quiz, questions);
    saveOfflineQuiz({ ...quiz, title: "Frissített" }, questions);

    expect(listOfflineQuizzes()).toHaveLength(1);
    expect(getOfflineQuiz(quiz.id)?.quiz.title).toBe("Frissített");

    removeOfflineQuiz(quiz.id);
    expect(getOfflineQuiz(quiz.id)).toBeNull();
  });

  test("syncs queued attempts and keeps failed items for a later retry", async () => {
    queueOfflineAttempt(quiz.id, { "question-1": 0 });
    queueOfflineAttempt("quiz-2", { "question-2": 1 });
    const submit = vi.fn(async (quizId: string) => {
      if (quizId === "quiz-2") throw new Error("temporary failure");
    });

    await expect(syncOfflineAttempts(submit)).resolves.toBe(1);
    expect(submit).toHaveBeenCalledTimes(2);

    const retry = vi.fn(async () => undefined);
    await expect(syncOfflineAttempts(retry)).resolves.toBe(1);
    expect(retry).toHaveBeenCalledWith("quiz-2", { "question-2": 1 });
  });

  test("does not submit queued attempts while offline", async () => {
    queueOfflineAttempt(quiz.id, { "question-1": 0 });
    vi.stubGlobal("navigator", { onLine: false });
    const submit = vi.fn();

    await expect(syncOfflineAttempts(submit)).resolves.toBe(0);
    expect(submit).not.toHaveBeenCalled();
  });
});
