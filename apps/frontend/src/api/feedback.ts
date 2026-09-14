import { api } from "./http";

export type FeedbackContact = { id: string; username: string; email: string; role: "teacher" | "student" };
export type FeedbackMessage = {
  id: string; message: string; topic_id?: string | null; topic_name?: string | null;
  author_id: string; author_name: string; created_at: string; read_at?: string | null;
};
export const getFeedbackContacts = () => api<FeedbackContact[]>("/api/feedback/contacts");
export const getFeedbackMessages = (partnerId: string) => api<FeedbackMessage[]>(`/api/feedback/${partnerId}`);
export const sendFeedbackMessage = (partnerId: string, message: string, topicId?: string | null) =>
  api<FeedbackMessage>(`/api/feedback/${partnerId}`, { method: "POST", body: JSON.stringify({ message, topic_id: topicId ?? null }) });
