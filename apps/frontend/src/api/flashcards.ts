import { api } from "./http";

export type Flashcard = {
  id: string; front: string; back: string; position: number;
  repetitions: number; interval_days: number; ease_factor: number; due_at: string; review_count: number;
};
export type FlashcardPack = {
  id: string; title: string; description?: string | null; topic_id?: string | null; topic_name?: string | null;
  owner_id: string; owner_name?: string; card_count: number; due_count: number; review_count: number; cards?: Flashcard[];
};
export type NewCard = Pick<Flashcard, "front" | "back">;

export const getFlashcardPacks = (topicId?: string | null) =>
  api<FlashcardPack[]>(`/api/flashcards/packs${topicId ? `?topic_id=${encodeURIComponent(topicId)}` : ""}`);
export const getFlashcardPack = (id: string) => api<FlashcardPack & { cards: Flashcard[] }>(`/api/flashcards/packs/${id}`);
export const createFlashcardPack = (data: { title: string; description?: string; topic_id?: string | null; cards: NewCard[] }) =>
  api<FlashcardPack>("/api/flashcards/packs", { method: "POST", body: JSON.stringify(data) });
export const importQuizAsPack = (quizId: string, title?: string) =>
  api<FlashcardPack>("/api/flashcards/packs/import-quiz", { method: "POST", body: JSON.stringify({ quiz_id: quizId, title }) });
export const reviewFlashcard = (packId: string, cardId: string, quality: number) =>
  api(`/api/flashcards/packs/${packId}/review`, { method: "POST", body: JSON.stringify({ card_id: cardId, quality }) });
export const deleteFlashcardPack = (id: string) => api(`/api/flashcards/packs/${id}`, { method: "DELETE" });
export const getFlashcardPackStats = (id: string) => api<Array<{
  student_id: string; username: string; email: string; cards_seen: number; reviews: number; success_rate: number; last_studied: string;
}>>(`/api/flashcards/packs/${id}/stats`);
export const shareFlashcardPack = (id: string, recipients?: string[]) =>
  api<{ tokens: Array<{ token: string; recipient_email?: string }> }>(`/api/flashcards/packs/${id}/share`, {
    method: "POST",
    body: JSON.stringify({ recipients: recipients?.length ? recipients : undefined }),
  });
export const claimFlashcardPack = (token: string) =>
  api<{ token: string }>("/api/flashcards/share/claim", { method: "POST", body: JSON.stringify({ token }) });
