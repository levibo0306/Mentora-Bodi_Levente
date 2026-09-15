import type { Flashcard, FlashcardPack } from "../api/flashcards";

export type OfflineFlashcardPack = FlashcardPack & {
  cards: Flashcard[];
  downloadedAt: string;
};

type PendingReview = {
  id: string;
  packId: string;
  cardId: string;
  quality: number;
  createdAt: string;
};

const currentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("mentora_user") ?? "null")?.id ?? "guest";
  } catch {
    return "guest";
  }
};

const packsKey = () => `mentora_offline_flashcards:${currentUserId()}`;
const reviewsKey = () => `mentora_pending_flashcard_reviews:${currentUserId()}`;

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
};

const writePacks = (packs: OfflineFlashcardPack[]) => {
  localStorage.setItem(packsKey(), JSON.stringify(packs));
};

export const listOfflineFlashcardPacks = (topicId?: string | null) => {
  const packs = read<OfflineFlashcardPack[]>(packsKey(), []);
  return topicId ? packs.filter((pack) => pack.topic_id === topicId) : packs;
};

export const getOfflineFlashcardPack = (packId: string) =>
  listOfflineFlashcardPacks().find((pack) => pack.id === packId) ?? null;

export const saveOfflineFlashcardPack = (pack: FlashcardPack & { cards: Flashcard[] }) => {
  const remaining = listOfflineFlashcardPacks().filter((item) => item.id !== pack.id);
  writePacks([{ ...pack, downloadedAt: new Date().toISOString() }, ...remaining]);
};

export const removeOfflineFlashcardPack = (packId: string) => {
  writePacks(listOfflineFlashcardPacks().filter((pack) => pack.id !== packId));
};

export const asOfflinePackSummary = (pack: OfflineFlashcardPack): FlashcardPack => ({
  ...pack,
  card_count: pack.cards.length,
  due_count: pack.cards.filter((card) => new Date(card.due_at).getTime() <= Date.now()).length,
  review_count: pack.cards.reduce((sum, card) => sum + Number(card.review_count || 0), 0),
});

export function applyOfflineFlashcardReview(packId: string, cardId: string, quality: number) {
  const packs = listOfflineFlashcardPacks();
  const pack = packs.find((item) => item.id === packId);
  const card = pack?.cards.find((item) => item.id === cardId);
  if (!pack || !card) return;

  const repetitions = quality < 3 ? 0 : Number(card.repetitions || 0) + 1;
  const intervalDays = quality < 3
    ? 1
    : repetitions === 1
      ? 1
      : repetitions === 2
        ? 6
        : Math.max(1, Math.round(Number(card.interval_days || 0) * Number(card.ease_factor || 2.5)));
  const easeFactor = Math.max(
    1.3,
    Number(card.ease_factor || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  Object.assign(card, {
    repetitions,
    interval_days: intervalDays,
    ease_factor: easeFactor,
    due_at: new Date(Date.now() + intervalDays * 86_400_000).toISOString(),
    review_count: Number(card.review_count || 0) + 1,
  });
  writePacks(packs);
}

export const queueOfflineFlashcardReview = (packId: string, cardId: string, quality: number) => {
  const pending = read<PendingReview[]>(reviewsKey(), []);
  pending.push({
    id: `${cardId}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    packId,
    cardId,
    quality,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(reviewsKey(), JSON.stringify(pending));
};

export async function syncOfflineFlashcardReviews(
  submit: (packId: string, cardId: string, quality: number) => Promise<unknown>
) {
  if (!navigator.onLine) return 0;
  const pending = read<PendingReview[]>(reviewsKey(), []);
  const remaining: PendingReview[] = [];
  let synced = 0;

  for (const review of pending) {
    try {
      await submit(review.packId, review.cardId, review.quality);
      synced += 1;
    } catch {
      remaining.push(review);
    }
  }
  localStorage.setItem(reviewsKey(), JSON.stringify(remaining));
  return synced;
}
