import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { pool } from "../db";
import { optionalAuth, requireAuth } from "../middleware/auth";
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

  const body = Body?.parse(req.body ?? {}) ?? {};

  const own = await pool.query("select 1 from quizzes where id=$1 and owner_id=$2", [id, userId]);

  let sourceShare: { allow_reshare: boolean; id: string } | null = null;
  if (own.rowCount === 0) {
    if (!body.source_token) {
      return res.status(403).json({ error: "No permission to share this quiz" });
    }
    const s = await pool.query(
      "select id, allow_reshare, quiz_id from quiz_shares where token=$1",
      [body.source_token]
    );
    if (s.rowCount === 0) return res.status(403).json({ error: "Invalid share token" });
    if (s.rows[0].quiz_id !== id) return res.status(403).json({ error: "Token mismatch" });
    if (!s.rows[0].allow_reshare) return res.status(403).json({ error: "Reshare not allowed" });
    sourceShare = { id: s.rows[0].id, allow_reshare: s.rows[0].allow_reshare };
  }

  const allowReshare =
    !!body.allow_reshare && ((own.rowCount ?? 0) > 0 || sourceShare?.allow_reshare);

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
  const { token } = Body.parse(req.body);

  const s = await pool.query(
    "select id, quiz_id, recipient_id, allow_reshare, shared_by, token from quiz_shares where token=$1",
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
shareRouter.get("/share/:token", optionalAuth, async (req, res) => {
  const { token } = z.object({ token: z.string().min(8) }).parse(req.params);

  const q = await pool.query(
    `select q.id, q.title, q.description
     from quiz_shares s join quizzes q on q.id = s.quiz_id
     where s.token = $1`,
    [token]
  );
  if (q.rowCount === 0) return res.status(404).json({ error: "Invalid link" });

  const quiz = q.rows[0];
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
shareRouter.post("/share/:token/submit", optionalAuth, async (req, res) => {
  const { token } = z.object({ token: z.string().min(8) }).parse(req.params);
  const Body = z.object({ answers: z.record(z.string(), z.number().int().min(0)) });
  const { answers } = Body.parse(req.body);

  const q = await pool.query(
    `select q.id
     from quiz_shares s join quizzes q on q.id = s.quiz_id
     where s.token = $1`,
    [token]
  );
  if (q.rowCount === 0) return res.status(404).json({ error: "Invalid link" });

  const quizId = q.rows[0].id;

  const correct = await pool.query("select id, correct_index from questions where quiz_id=$1", [quizId]);

  let score = 0;
  for (const row of correct.rows) {
    const given = answers[row.id];
    if (given === row.correct_index) score++;
  }

  const max = correct.rowCount ?? 0;
  const scorePercent = max > 0 ? Math.round((score / max) * 100) : 0;

  const userId = req.user?.sub ?? null;
  await pool.query("insert into attempts(quiz_id, user_id, answers, score) values($1,$2,$3,$4)", [
    quizId,
    userId,
    JSON.stringify(answers),
    scorePercent,
  ]);

  if (userId) {
    const tzOffset = Number(req.headers["x-timezone-offset"] ?? 0);
    await updateDailyMissionsOnAttempt(userId, scorePercent, Number.isFinite(tzOffset) ? tzOffset : 0);
  }

  res.json({ score, max });
});
