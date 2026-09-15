import { api } from "./http";

export type FeedbackContact = { id: string; username: string; email: string; role: "teacher" | "student" };
export type FeedbackMessage = {
  id: string; message: string; topic_id?: string | null; topic_name?: string | null;
  target_type?: "topic" | "quiz" | "flashcards" | null; target_title?: string | null;
  author_id: string; author_name: string; created_at: string; read_at?: string | null;
};
export type FeedbackTarget = { type: "topic" | "quiz" | "flashcards"; id: string; title: string };
export const getFeedbackContacts = () => api<FeedbackContact[]>("/api/feedback/contacts");
export const getFeedbackMessages = (partnerId: string) => api<FeedbackMessage[]>(`/api/feedback/${partnerId}`);
export const getFeedbackTargets = (partnerId: string) => api<FeedbackTarget[]>(`/api/feedback/${partnerId}/targets`);
export const sendFeedbackMessage = (partnerId: string, message: string, target?: FeedbackTarget | null) =>
  api<FeedbackMessage>(`/api/feedback/${partnerId}`, { method: "POST", body: JSON.stringify({ message, target_type: target?.type ?? null, target_id: target?.id ?? null }) });
