import type { PoolClient } from "pg";
import { z } from "zod";
import { pool } from "../db";

export const quizSubmission = z.object({ answers: z.record(z.string().uuid(), z.number().int().min(0)) });

export const alreadySubmitted = "Ezt a vizsgát már kitöltötted.";

export class QuizAttemptError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function checkAssessment(
  db: Pick<PoolClient, "query">,
  quizId: string,
  userId: string | null,
  recipientId?: string | null,
) {
  if (!userId) throw new QuizAttemptError(403, "A vizsgához jelentkezz be.");
  if (recipientId && recipientId !== userId) throw new QuizAttemptError(403, "Ez a vizsgalink másik felhasználóhoz tartozik.");
  const prior = await db.query("SELECT 1 FROM attempts WHERE quiz_id=$1 AND user_id=$2 LIMIT 1", [quizId, userId]);
  if (prior.rowCount) throw new QuizAttemptError(409, alreadySubmitted);
}

export async function saveQuizAttempt<T>(
  quizId: string,
  userId: string | null,
  save: (client: PoolClient, assessment: boolean) => Promise<T>,
  recipientId?: string | null,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serialize checks and writes across both submission routes, including concurrent requests.
    const quiz = await client.query("SELECT mode FROM quizzes WHERE id=$1 FOR UPDATE", [quizId]);
    if (!quiz.rowCount) throw new QuizAttemptError(404, "A kvíz nem érhető el.");
    const assessment = quiz.rows[0].mode === "assessment";
    if (assessment) await checkAssessment(client, quizId, userId, recipientId);
    const result = await save(client, assessment);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Both assessment entry points use the complete server-defined question set.
export async function getAssessmentQuestions(db: Pick<PoolClient, "query">, quizId: string) {
  const { rows } = await db.query<{ id: string; prompt: string; options: string[]; correct_index: number }>(
    "SELECT id, prompt, options, correct_index FROM questions WHERE quiz_id=$1 ORDER BY id", [quizId],
  );
  return rows;
}

export function validateAssessmentAnswers(
  questions: Awaited<ReturnType<typeof getAssessmentQuestions>>,
  answers: Record<string, number>,
) {
  const ids = Object.keys(answers);
  const byId = new Map(questions.map((question) => [question.id, question]));
  if (!ids.length || ids.some((id) => !byId.has(id) || answers[id] >= byId.get(id)!.options.length)) {
    throw new QuizAttemptError(400, "A vizsgaválaszok között nincs érvényes kitöltés, vagy hibás kérdés szerepel.");
  }
}
