import { api } from "./http";

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  mode: 'practice' | 'assessment';
  topic_id?: string | null;
  owner_id?: string | null;
  is_owner?: boolean;
  difficulty?: number;
  avg_difficulty?: number | string | null;
  question_count?: number;
  total_attempts?: number;
  created_at: string;
  updated_at: string;
}

export type CreateQuizDto = {
  title: string;
  description?: string;
  mode: 'practice' | 'assessment';
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
  explanation?: string | null;
  difficulty?: number;
};

export type AdaptiveQuizQuestion = Omit<QuizQuestion, "correct_index"> & { correct_index?: number };

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
export async function getQuizzes(topicId?: string | null) {
  const qs = topicId ? `?topic_id=${encodeURIComponent(topicId)}` : "";
  return api<Quiz[]>(`/api/quizzes${qs}`);
}

export const getImportableQuizzes = () => api<Quiz[]>("/api/quizzes/importable");

export async function getQuiz(id: string) {
  return api<Quiz>(`/api/quizzes/${id}`);
}

export async function getQuizQuestions(id: string) {
  const questions = await api<QuizQuestion[]>(`/api/quizzes/${id}/questions`);
  return questions.map((question) => ({
    ...question,
    options: typeof question.options === "string" ? JSON.parse(question.options) : question.options,
  }));
}

export async function getAdaptiveQuizQuestions(id: string, limit = 10) {
  const questions = await api<AdaptiveQuizQuestion[]>(`/api/quizzes/${id}/adaptive-questions?limit=${limit}`);
  return questions.map((question) => ({
    ...question,
    options: typeof question.options === "string" ? JSON.parse(question.options) : question.options,
  }));
}

export async function createQuiz(data: CreateQuizDto) {
  return api<Quiz>("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuiz(id: string, data: Partial<CreateQuizDto>) {
  return api<Quiz>(`/api/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteQuiz(id: string) {
  return api<{ ok: boolean }>(`/api/quizzes/${id}`, {
    method: "DELETE",
  });
}

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

export type DocumentGenerationResult = {
  questions: CreateQuestionDto[];
  source: { filename: string; characters: number; truncated: boolean };
};

export async function generateQuestionsFromDocument(file: File, count: number, signal?: AbortSignal) {
  const body = new FormData();
  body.append("file", file);
  body.append("count", String(count));
  return api<DocumentGenerationResult>("/api/quizzes/generate-ai-file", {
    method: "POST",
    body,
    signal,
  });
}

export async function getQuizResults(id: string) {
  return api<QuizResults>(`/api/quizzes/${id}/results`);
}
