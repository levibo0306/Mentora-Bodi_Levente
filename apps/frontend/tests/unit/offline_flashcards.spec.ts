import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  applyOfflineFlashcardReview,
  getOfflineFlashcardPack,
  queueOfflineFlashcardReview,
  saveOfflineFlashcardPack,
  syncOfflineFlashcardReviews,
} from "../../src/infra/offlineFlashcards";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

describe("offline Flashcards", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
    vi.stubGlobal("navigator", { onLine: true });
    localStorage.setItem("mentora_user", JSON.stringify({ id: "student-1" }));
  });

  test("stores a pack and updates its local repetition schedule", () => {
    saveOfflineFlashcardPack({
      id: "pack-1",
      title: "Biológia",
      owner_id: "teacher-1",
      card_count: 1,
      due_count: 1,
      review_count: 0,
      cards: [{
        id: "card-1",
        front: "Sejt",
        back: "Az élőlények alapegysége",
        position: 0,
        repetitions: 0,
        interval_days: 0,
        ease_factor: 2.5,
        due_at: new Date(0).toISOString(),
        review_count: 0,
      }],
    });

    applyOfflineFlashcardReview("pack-1", "card-1", 4);
    const card = getOfflineFlashcardPack("pack-1")?.cards[0];

    expect(card?.repetitions).toBe(1);
    expect(card?.interval_days).toBe(1);
    expect(card?.review_count).toBe(1);
  });

  test("sends queued reviews when the connection returns", async () => {
    queueOfflineFlashcardReview("pack-1", "card-1", 3);
    const submit = vi.fn().mockResolvedValue({});

    expect(await syncOfflineFlashcardReviews(submit)).toBe(1);
    expect(submit).toHaveBeenCalledWith("pack-1", "card-1", 3);
    expect(await syncOfflineFlashcardReviews(submit)).toBe(0);
  });
});
