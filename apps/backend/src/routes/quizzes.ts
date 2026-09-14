import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { AiServiceError, generateQuizFromText } from "../services/ai";
import { addXp, updateDailyMissionsOnAttempt } from "../services/gamification";

export const quizzesRouter = Router();

/**
 * Helpers
 */
const uuidParam = z.object({ id: z.string().uuid() });

/**
 * --- KVÍZ CRUD ---
 */

quizzesRouter.get("/", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  const role = req.user?.role;
  const topicId = typeof req.query.topic_id === "string" ? req.query.topic_id : null;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (topicId) {
      if (role === "teacher") {
        const r = await pool.query(
          `SELECT 
              q.id, q.title, q.description, q.mode, q.created_at, q.updated_at, q.topic_id,
              (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)::int as question_count,
              (SELECT COUNT(*) FROM attempts WHERE quiz_id = q.id)::int as total_attempts,
              (SELECT AVG(difficulty) FROM questions WHERE quiz_id = q.id)::float as avg_difficulty
           FROM quizzes q
           WHERE q.owner_id = $1 AND q.topic_id = $2
           ORDER BY q.created_at DESC`,
          [userId, topicId]
        );
        return res.json(r.rows);
      }

      const allowed = await pool.query(
        "select 1 from topic_shares where topic_id=$1 and recipient_id=$2",
        [topicId, userId]
      );
      if (allowed.rowCount === 0) return res.status(403).json({ error: "Not allowed" });

      const r = await pool.query(
        `SELECT 
            q.id, q.title, q.description, q.mode, q.created_at, q.updated_at, q.topic_id,
            (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)::int as question_count,
            (SELECT COUNT(*) FROM attempts WHERE quiz_id = q.id)::int as total_attempts,
            (SELECT AVG(difficulty) FROM questions WHERE quiz_id = q.id)::float as avg_difficulty
         FROM quizzes q
         WHERE q.topic_id = $1
         ORDER BY q.created_at DESC`,
        [topicId]
      );
      return res.json(r.rows);
    }

    const r = await pool.query(
      `SELECT 
          q.id, q.title, q.description, q.mode, q.created_at, q.updated_at, q.topic_id,
          (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)::int as question_count,
          (SELECT COUNT(*) FROM attempts WHERE quiz_id = q.id)::int as total_attempts,
          (SELECT AVG(difficulty) FROM questions WHERE quiz_id = q.id)::float as avg_difficulty
       FROM quizzes q
       WHERE q.owner_id = $1 OR q.owner_id IS NULL
       ORDER BY q.created_at DESC`,
      [userId]
    );

    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

quizzesRouter.get("/shared-with-me", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const r = await pool.query(
      `SELECT 
          q.id, q.title, q.description, q.mode,
          s.token, s.created_at as shared_at,
          s.allow_reshare,
          COALESCE(owner.username, owner.email) as owner_display,
          COALESCE(sharer.username, sharer.email) as shared_by_display,
          (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id)::int as question_count
       FROM quiz_shares s
       JOIN quizzes q ON q.id = s.quiz_id
       LEFT JOIN users owner ON owner.id = q.owner_id
       LEFT JOIN users sharer ON sharer.id = s.shared_by
       WHERE s.recipient_id = $1
       ORDER BY s.created_at DESC LIMIT 50`,
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

quizzesRouter.get("/:id/results", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);

  try {
    const check = await pool.query(
      "SELECT 1 FROM quizzes WHERE id=$1 AND owner_id=$2",
      [id, userId]
    );
    if (check.rowCount === 0)
      return res.status(403).json({ error: "Ehhez nincs jogosultságod (vagy nem létezik)" });

    const questionsRes = await pool.query(
      `SELECT id, prompt, options, correct_index
       FROM questions
       WHERE quiz_id=$1
       ORDER BY id`,
      [id]
    );
    const questions = questionsRes.rows as Array<{
      id: string;
      prompt: string;
      options: string[];
      correct_index: number;
    }>;

    const attemptsRes = await pool.query(
      `SELECT 
         a.id,
         a.user_id,
         a.answers,
         a.score,
         a.created_at,
         u.email as student_email
       FROM attempts a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.quiz_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    const stats = questions.map((q) => ({
      question_id: q.id,
      counts: new Array(q.options.length).fill(0),
      correct_index: q.correct_index,
      total: 0,
      correct_count: 0,
    }));
    const statsById = new Map(stats.map((s) => [s.question_id, s]));

    for (const att of attemptsRes.rows) {
      const answers = att.answers ?? {};
      for (const q of questions) {
        const selected = answers[q.id];
        if (selected === undefined) continue;
        const s = statsById.get(q.id);
        if (!s) continue;
        if (selected >= 0 && selected < s.counts.length) {
          s.counts[selected] += 1;
          s.total += 1;
          if (selected === s.correct_index) s.correct_count += 1;
        }
      }
    }

    res.json({
      questions,
      attempts: attemptsRes.rows,
      stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

quizzesRouter.get("/:id", requireAuth, async (req: any, res) => {
  const { id } = uuidParam.parse(req.params);

  try {
    const r = await pool.query(
      `SELECT id, title, description, mode, owner_id, topic_id, created_at, updated_at
       FROM quizzes
       WHERE id=$1`,
      [id]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const CreateQuiz = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  mode: z.enum(["practice", "assessment"]).optional(),
  topic_id: z.string().uuid().optional(),
});

quizzesRouter.post("/", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, mode, topic_id } = CreateQuiz.parse(req.body);

  try {
    const r = await pool.query(
      `INSERT INTO quizzes(owner_id, title, description, mode, topic_id)
       VALUES($1,$2,$3, COALESCE($4, 'practice'), $5)
       RETURNING id, title, description, mode, created_at, updated_at`,
      [userId, title.trim(), description ?? null, mode ?? null, topic_id ?? null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

quizzesRouter.put("/:id", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);
  const body = CreateQuiz.partial().parse(req.body);

  try {
    const r = await pool.query(
      `UPDATE quizzes
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         mode = COALESCE($3, mode),
         topic_id = COALESCE($4, topic_id)
       WHERE id=$5 AND owner_id=$6
       RETURNING id, title, description, mode, created_at, updated_at`,
      [body.title?.trim(), body.description ?? null, body.mode ?? null, body.topic_id ?? null, id, userId]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: "Not found or not yours" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

quizzesRouter.delete("/:id", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);

  try {
    const r = await pool.query("DELETE FROM quizzes WHERE id=$1 AND owner_id=$2", [id, userId]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found or not yours" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * --- KÉRDÉSEK ---
 */

const QuestionSchema = z.object({
  prompt: z.string().min(1),
  options: z.array(z.string()).min(2),
  correct_index: z.number().int().min(0),
  explanation: z.string().nullable().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
});

quizzesRouter.post("/:id/questions", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);

  try {
    const body = QuestionSchema.parse(req.body);

    const own = await pool.query(
      "SELECT 1 FROM quizzes WHERE id=$1 AND owner_id=$2",
      [id, userId]
    );
    if (own.rowCount === 0) return res.status(404).json({ error: "Quiz not found or not yours" });

    // jsonb mezőbe mehet natívan a JS array
    const r = await pool.query(
      `insert into questions (quiz_id, prompt, options, correct_index, explanation, difficulty)
 values ($1, $2, $3::jsonb, $4, $5, $6)
 returning *`,
[
  id,
  body.prompt,
  JSON.stringify(body.options),
  body.correct_index,
  body.explanation ?? null,
  body.difficulty ?? 3
]
    );

    res.status(201).json(r.rows[0]);
  } catch (err: any) {
    console.error("Backend Error:", err);
    res.status(400).json({ error: err.message ?? "Bad request" });
  }
});

quizzesRouter.put("/:id/questions/:qid", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);
  const QuestionIdSchema = z.object({ qid: z.string().uuid() });
  const { qid } = QuestionIdSchema.parse(req.params);

  try {
    const body = QuestionSchema.parse(req.body);

    const own = await pool.query(
      "SELECT 1 FROM quizzes WHERE id=$1 AND owner_id=$2",
      [id, userId]
    );
    if (own.rowCount === 0) return res.status(404).json({ error: "Quiz not found or not yours" });

    const r = await pool.query(
      `UPDATE questions
       SET prompt=$1, options=$2::jsonb, correct_index=$3, explanation=$4, difficulty=$5
       WHERE id=$6 AND quiz_id=$7
       RETURNING *`,
      [
        body.prompt,
        JSON.stringify(body.options),
        body.correct_index,
        body.explanation ?? null,
        body.difficulty ?? 3,
        qid,
        id,
      ]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: "Question not found" });
    res.json(r.rows[0]);
  } catch (err: any) {
    console.error("Backend Error:", err);
    res.status(400).json({ error: err.message ?? "Bad request" });
  }
});

quizzesRouter.get("/:id/questions", requireAuth, async (req: any, res) => {
  const { id } = uuidParam.parse(req.params);

  try {
    const r = await pool.query(
      `SELECT id, quiz_id, prompt, options, correct_index, explanation, difficulty, total_attempts, correct_attempts
       FROM questions
       WHERE quiz_id=$1
       ORDER BY id`,
      [id]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * --- KITÖLTÉS + ADAPTÍV LOGIKA ---
 * - Kiértékel
 * - Attempt mentés
 * - Question stat + difficulty frissítés (1 UPDATE / kérdés)
 * - XP jóváírás
 */
quizzesRouter.post("/:id/attempt", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);

  const { answers } = z
    .object({ answers: z.record(z.string(), z.number()) })
    .parse(req.body);

  try {
    // Kérdések lekérése
    const qRes = await pool.query(
      "SELECT id, correct_index FROM questions WHERE quiz_id=$1",
      [id]
    );
    const questions = qRes.rows as Array<{ id: string; correct_index: number }>;

    let correctCount = 0;

    // 1) Kiértékelés + adaptív stat frissítés
    for (const q of questions) {
      const picked = answers[q.id];
      const isCorrect = picked === q.correct_index;
      if (isCorrect) correctCount++;

      // 1 UPDATE: total_attempts, correct_attempts, difficulty (a már növelt értékekkel számolva)
      await pool.query(
        `UPDATE questions
         SET
           total_attempts   = total_attempts + 1,
           correct_attempts = correct_attempts + $1,
           difficulty = CASE
             WHEN (total_attempts + 1) >= 5
                  AND ((correct_attempts + $1)::float / (total_attempts + 1)) > 0.8
               THEN GREATEST(1, COALESCE(difficulty, 3) - 1)

             WHEN (total_attempts + 1) >= 5
                  AND ((correct_attempts + $1)::float / (total_attempts + 1)) < 0.2
               THEN LEAST(5, COALESCE(difficulty, 3) + 1)

             ELSE COALESCE(difficulty, 3)
           END
         WHERE id = $2`,
        [isCorrect ? 1 : 0, q.id]
      );
    }

    const score =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;

    // 2) Attempt mentése (answers jsonb, mehet natívan)
    const att = await pool.query(
      `INSERT INTO attempts (quiz_id, user_id, answers, score)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [id, userId, answers, score]
    );

    // 3) XP jóváírás
    const xpReward = Math.ceil(score / 10);
    await addXp(userId, xpReward);
    const tzOffset = Number(req.headers["x-timezone-offset"] ?? 0);
    await updateDailyMissionsOnAttempt(userId, score, Number.isFinite(tzOffset) ? tzOffset : 0);

    res.json({
      score,
      total: questions.length,
      correct: correctCount,
      xp_gained: xpReward,
      id: att.rows[0].id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * --- AI GENERÁLÁS ---
 */
quizzesRouter.post("/generate-ai", requireAuth, async (req: any, res) => {
  const { text, count } = z.object({
    text: z.string().trim().min(50).max(7_000),
    count: z.number().int().min(1).max(10).default(5),
  }).parse(req.body);
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const questions = await generateQuizFromText(text, count, controller.signal);
    res.json(questions);
  } catch (err) {
    console.error("AI Error:", err);
    if (err instanceof AiServiceError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: "Nem sikerült a kérdések generálása." });
  }
});

/**
 * --- STATISZTIKA (Tanári nézet) ---
 */
quizzesRouter.get("/:id/stats", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = uuidParam.parse(req.params);

  try {
    // csak owner
    const check = await pool.query(
      "SELECT 1 FROM quizzes WHERE id=$1 AND owner_id=$2",
      [id, userId]
    );
    if (check.rowCount === 0)
      return res.status(403).json({ error: "Ehhez nincs jogosultságod (vagy nem létezik)" });

    const r = await pool.query(
      `SELECT 
         a.id, 
         a.score, 
         a.created_at,
         u.email as student_email
       FROM attempts a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.quiz_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    const avg = await pool.query(
      `SELECT AVG(score)::int as avg_score, COUNT(*)::int as total_attempts 
       FROM attempts
       WHERE quiz_id=$1`,
      [id]
    );

    res.json({
      attempts: r.rows,
      summary: avg.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
