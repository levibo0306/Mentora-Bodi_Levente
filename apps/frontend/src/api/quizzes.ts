import type { Quiz } from "../core/quizLogic";
import { api } from "./http";

export async function fetchQuizzes(): Promise<Quiz[]> {
  const res = await api("/api/quizzes");
  return res.json();
}

export async function createQuiz(title: string): Promise<Quiz> {
  const res = await api("/api/quizzes", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return res.json();
}

// ezek később backend oldalon is kellenek:
export async function deleteQuiz(id: string): Promise<void> {
  await api(`/api/quizzes/${id}`, { method: "DELETE" });
}

export async function shareQuiz(id: string): Promise<{ token: string }> {
  const res = await api(`/api/quizzes/${id}/share`, { method: "POST" });
  return res.json();
}
