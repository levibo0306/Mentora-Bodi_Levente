// apps/frontend/src/api/quizzes.ts
import { api } from "./http"; // Most már az 'api'-t importáljuk a te kódod alapján


// apps/frontend/src/api/quizzes.ts

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  mode: 'practice' | 'assessment';
  topic_id?: string | null;
  difficulty?: number;      // Ez maradjon meg a biztonság kedvéért
  avg_difficulty?: number | string | null;
  question_count?: number;
  total_attempts?: number;
  created_at: string;
  updated_at: string;
}

export type CreateQuizDto = {
  title: string;
  description?: string;
  mode: 'practice' | 'assessment'; // Ezt add hozzá!
  difficulty?: number; 
  topic_id?: string;
};

export type CreateQuestionDto = {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  difficulty: number; 
};

// Válaszok típusa: { kerdes_id: valasztott_index }
export type QuizSubmission = {
  [questionId: string]: number; 
};

export type QuizResult = {
  score: number;   // Százalék (0-100)
  total: number;   // Összes kérdés száma
  correct: number; // Helyes válaszok száma
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correct_index: number;
};

export type QuizAttempt = {
  id: string;
  user_id: string | null;
  student_email: string | null;
  answers: Record<string, number>;
  score: number;
  created_at: string;
};

export type QuizQuestionStats = {
  question_id: string;
  counts: number[];
  correct_index: number;
  total: number;
  correct_count: number;
};

export type QuizResults = {
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  stats: QuizQuestionStats[];
};
// --- API Hívások ---

// Kvízek listázása
export async function getQuizzes(topicId?: string | null) {
  // A backend az '/api/quizzes' útvonalon figyel (lásd backend/src/index.ts)
  const qs = topicId ? `?topic_id=${encodeURIComponent(topicId)}` : "";
  return api<Quiz[]>(`/api/quizzes${qs}`);
}

// Egy kvíz lekérése
export async function getQuiz(id: string) {
  return api<Quiz>(`/api/quizzes/${id}`);
}

// Kvíz létrehozása
export async function createQuiz(data: CreateQuizDto) {
  return api<Quiz>("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(data), // Fontos: stringify kell, mert az api() wrappered csak a header-t állítja be
  });
}

// Kvíz módosítása
export async function updateQuiz(id: string, data: Partial<CreateQuizDto>) {
  return api<Quiz>(`/api/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Kvíz törlése
export async function deleteQuiz(id: string) {
  return api<{ ok: boolean }>(`/api/quizzes/${id}`, {
    method: "DELETE",
  });
}

// Kérdés hozzáadása (EZT HASZNÁLJA A MODAL)
export async function createQuestion(quizId: string, data: CreateQuestionDto) {
  return api<any>(`/api/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(quizId: string, questionId: string, data: CreateQuestionDto) {
  return api<any>(`/api/quizzes/${quizId}/questions/${questionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export async function submitQuizAttempt(quizId: string, answers: QuizSubmission) {
  return api<QuizResult>(`/api/quizzes/${quizId}/attempt`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function generateQuestionsAI(text: string, count: number, signal?: AbortSignal) {
  return api<CreateQuestionDto[]>("/api/quizzes/generate-ai", {
    method: "POST",
    body: JSON.stringify({ text, count }),
    signal,
  });
}

export async function getQuizResults(id: string) {
  return api<QuizResults>(`/api/quizzes/${id}/results`);
}
