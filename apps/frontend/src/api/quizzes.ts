import type { Quiz } from "../core/quizLogic";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const API = `${BASE}/api/quizzes`;

export async function fetchQuizzes(): Promise<Quiz[]> {
  const res = await fetch(API, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return res.json();
}

export async function createQuiz(title: string): Promise<Quiz> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to create quiz");
  return res.json();
}
