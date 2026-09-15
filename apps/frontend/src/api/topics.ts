import { api } from "./http";

export type Topic = {
  id: string;
  name: string;
  description?: string | null;
  subject?: string | null;
  grade?: string | null;
  color?: string | null;
  is_owner?: boolean;
  created_at: string;
};

export async function getTopics() {
  return api<Topic[]>("/api/topics");
}

export async function getTopic(id: string) {
  return api<Topic>(`/api/topics/${id}`);
}

export type TopicStats = {
  quizzes: Array<{ id: string; title: string; attempts: number; students: number; avg_score: number }>;
  packs: Array<{ id: string; title: string; cards: number; students: number; reviews: number; success_rate: number }>;
};

export const getTopicStats = (id: string) => api<TopicStats>(`/api/topics/${id}/stats`);

export async function createTopic(data: {
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  color?: string;
}) {
  return api<Topic>("/api/topics", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTopic(id: string) {
  return api<{ ok: boolean }>(`/api/topics/${id}`, {
    method: "DELETE",
  });
}

export async function shareTopic(id: string, recipients?: string[], allowReshare?: boolean) {
  return api<{ tokens: Array<{ token: string; recipient_email?: string }> }>(`/api/topics/${id}/share`, {
    method: "POST",
    body: JSON.stringify({ recipients, allow_reshare: allowReshare }),
  });
}

export async function claimTopic(token: string) {
  return api<{ token: string }>(`/api/topics/share/claim`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
