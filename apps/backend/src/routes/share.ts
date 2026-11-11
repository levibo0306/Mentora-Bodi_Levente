import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { pool } from "../db";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { checkAssessment, getAssessmentQuestions, QuizAttemptError, quizSubmission, saveQuizAttempt, validateAssessmentAnswers } from "../services/quizAttempts";
import { updateDailyMissionsOnAttempt } from "../services/gamification";

export const shareRouter = Router();

// Create share link(s) for a quiz (teacher or student with reshare permission)
shareRouter.post("/quizzes/:id/share", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  const Body = z
    .object({
      recipients: z.array(z.string().email()).optional(),
      allow_reshare: z.boolean().optional(),
      source_token: z.string().min(8).optional(),
    })
    .optional();

  const parsed = Body.safeParse(req.body ?? {});
  if (!parsed.success || !z.string().uuid().safeParse(id).success) return res.status(400).json({ error: "Érvénytelen megosztási adatok." });
  const body = parsed.data ?? {};

  const quiz = await pool.query("select owner_id, mode from quizzes where id=$1", [id]);
  if (!quiz.rowCount) return res.status(404).json({ error: "A kvíz nem érhető el." });
  const isOwner = quiz.rows[0].owner_id === userId;
  const assessment = quiz.rows[0].mode === "assessment";
  if (assessment && !isOwner) return res.status(403).json({ error: "Vizsgát csak a tulajdonos oszthat meg." });

  let sourceShare: { allow_reshare: boolean; id: string } | null = null;
  if (!isOwner) {
    if (!body.source_token) {
      return res.status(403).json({ error: "No permission to share this quiz" });
    }
    const s = await pool.query(
      "select id, allow_reshare, quiz_id, recipient_id from quiz_shares where token=$1",
      [body.source_token]
    );
    if (s.rowCount === 0) return res.status(403).json({ error: "Invalid share token" });
    if (s.rows[0].quiz_id !== id) return res.status(403).json({ error: "Token mismatch" });
    if (s.rows[0].recipient_id && s.rows[0].recipient_id !== userId) return res.status(403).json({ error: "Ez a link másik felhasználóhoz tartozik." });
    if (!s.rows[0].allow_reshare) return res.status(403).json({ error: "Reshare not allowed" });
    sourceShare = { id: s.rows[0].id, allow_reshare: s.rows[0].allow_reshare };
  }

  const allowReshare =
    !assessment && !!body.allow_reshare && (isOwner || sourceShare?.allow_reshare);

  const recipients = (body.recipients ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean);

  let recipientRows: Array<{ id: string; email: string }> = [];
  if (recipients.length > 0) {
    const r = await pool.query("select id, email from users where email = ANY($1)", [recipients]);
    recipientRows = r.rows;
    const found = new Set(recipientRows.map((u) => u.email.toLowerCase()));
    const missing = recipients.filter((e) => !found.has(e.toLowerCase()));
    if (missing.length > 0) {
      return res.status(400).json({ error: "Some recipients not found", missing });
    }
  }

  const tokens: Array<{ token: string; recipient_email?: string }> = [];

  if (recipientRows.length === 0) {
  const token = nanoid(8);
    await pool.query(
      "insert into quiz_shares(quiz_id, token, shared_by, allow_reshare, parent_share_id) values($1,$2,$3,$4,$5)",
      [id, token, userId, allowReshare, sourceShare?.id ?? null]
    );
    tokens.push({ token });
  } else {
    for (const recipient of recipientRows) {
      const token = nanoid(8);
      await pool.query(
        "insert into quiz_shares(quiz_id, token, recipient_id, shared_by, allow_reshare, parent_share_id) values($1,$2,$3,$4,$5,$6)",
        [id, token, recipient.id, userId, allowReshare, sourceShare?.id ?? null]
      );
      tokens.push({ token, recipient_email: recipient.email });
    }
  }

  res.json({ tokens });
});

// Claim a shared quiz by code/link
shareRouter.post("/share/claim", requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const Body = z.object({ token: z.string().min(6) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Érvénytelen megosztási kód." });
  const { token } = parsed.data;

  const s = await pool.query(
    `select s.id, s.quiz_id, s.recipient_id, s.allow_reshare, s.shared_by, s.token
     from quiz_shares s join quizzes q on q.id=s.quiz_id
     where s.token=$1 AND (q.mode IS DISTINCT FROM 'assessment' OR s.shared_by=q.owner_id)`,
    [token]
  );
  if (s.rowCount === 0) return res.status(404).json({ error: "Invalid code" });
  const share = s.rows[0];

  if (share.recipient_id && share.recipient_id !== userId) {
    return res.status(403).json({ error: "Not allowed" });
  }

  if (share.recipient_id === userId) {
    return res.json({ token: share.token });
  }

  const newToken = nanoid(8);
  await pool.query(
    "insert into quiz_shares(quiz_id, token, recipient_id, shared_by, allow_reshare, parent_share_id) values($1,$2,$3,$4,$5,$6)",
    [share.quiz_id, newToken, userId, share.shared_by, share.allow_reshare, share.id]
  );

  res.json({ token: newToken });
});

// Student/public: get shared quiz by token
shareRouter.get("/share/:token", optionalAuth, async (req, res, next) => {
  const token = req.params.token;
  if (token.length < 8) return res.status(404).json({ error: "Invalid link" });

  const q = await pool.query(
    `select q.id, q.title, q.description, q.mode, s.recipient_id
     from quiz_shares s join quizzes q on q.id = s.quiz_id
     where s.token = $1 AND (q.mode IS DISTINCT FROM 'assessment' OR s.shared_by=q.owner_id)`,
    [token]
  );
  if (q.rowCount === 0) return res.status(404).json({ error: "Invalid link" });

  const { recipient_id, ...quiz } = q.rows[0];
  if (quiz.mode === "assessment") {
    try {
      await checkAssessment(pool, quiz.id, req.user?.sub ?? null, recipient_id);
    } catch (error) {
      if (error instanceof QuizAttemptError) return res.status(error.status).json({ error: error.message });
      return next(error);
    }
  }
  const qs = await pool.query(
    `select id, prompt, options
     from questions
     where quiz_id=$1
     order by id`,
    [quiz.id]
  );

  res.json({ quiz, questions: qs.rows });
});

// Student/public: submit answers and get score
shareRouter.post("/share/:token/submit", optionalAuth, async (req, res, next) => {
  const token = req.params.token;
  if (token.length < 8) return res.status(404).json({ error: "Invalid link" });
  const parsed = quizSubmission.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Érvénytelen kvízválaszok." });
  const { answers } = parsed.data;

  const q = await pool.query(
    `select q.id, s.recipient_id
     from quiz_shares s join quizzes q on q.id = s.quiz_id
     where s.token = $1 AND (q.mode IS DISTINCT FROM 'assessment' OR s.shared_by=q.owner_id)`,
    [token]
  );
  if (q.rowCount === 0) return res.status(404).json({ error: "Invalid link" });

  const quizId = q.rows[0].id;

  const userId = req.user?.sub ?? null;
  try {
    const { score, max, scorePercent } = await saveQuizAttempt(quizId, userId, async (client, assessment) => {
      const questions = await getAssessmentQuestions(client, quizId);
      if (assessment) validateAssessmentAnswers(questions, answers);

      let score = 0;
      for (const row of questions) {
        const given = answers[row.id];
        if (given === row.correct_index) score++;
      }

      const max = questions.length;
      const scorePercent = max > 0 ? Math.round((score / max) * 100) : 0;

      await client.query("insert into attempts(quiz_id, user_id, answers, score) values($1,$2,$3,$4)", [
        quizId,
        userId,
        JSON.stringify(answers),
        scorePercent,
      ]);

      return { score, max, scorePercent };
    }, q.rows[0].recipient_id);

    if (userId) {
      const tzOffset = Number(req.headers["x-timezone-offset"] ?? 0);
      await updateDailyMissionsOnAttempt(userId, scorePercent, Number.isFinite(tzOffset) ? tzOffset : 0);
    }

    res.json({ score, max });
  } catch (error) {
    if (error instanceof QuizAttemptError) return res.status(error.status).json({ error: error.message });
    return next(error);
  }
});
