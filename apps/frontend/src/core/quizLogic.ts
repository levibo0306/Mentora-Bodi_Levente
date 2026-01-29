export type Quiz = {
  id: string;
  title: string;
};

export type CreateQuizResult =
  | { quiz: Quiz; error?: undefined }
  | { quiz?: undefined; error: string };

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createQuiz(title: string): CreateQuizResult {
  if (!title || title.trim() === "") {
    return { error: "A cím kötelező" };
  }

  const quiz: Quiz = {
    id: generateId(),
    title: formatTitle(title),
  };

  return { quiz };
}

export function validateQuizForm(input: { title: string }): boolean {
  return !!input.title && input.title.trim().length > 0;
}

export function isEmptyState(quizzes: Quiz[] | null | undefined): boolean {
  return !quizzes || quizzes.length === 0;
}

export function formatError(_err: unknown): string {
  return "Hiba történt";
}

export function formatTitle(title: string): string {
  return title.trim().toUpperCase();
}
