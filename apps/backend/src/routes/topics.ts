import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { recordLearningEvent } from "../services/gamification";

export const topicsRouter = Router();

const TopicSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  subject: z.string().max(120).optional(),
  grade: z.string().max(120).optional(),
  color: z.string().max(32).optional(),
});

topicsRouter.get("/", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const r = await pool.query(
      `SELECT DISTINCT t.id, t.name, t.description, t.subject, t.grade, t.color, t.created_at,
              (t.owner_id=$1) AS is_owner
       FROM topics t
       LEFT JOIN topic_shares s ON s.topic_id=t.id AND s.recipient_id=$1
       WHERE t.owner_id=$1 OR s.id IS NOT NULL
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

topicsRouter.get("/:id", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

  try {
    const r = await pool.query(
      `SELECT DISTINCT t.id, t.name, t.description, t.subject, t.grade, t.color, t.created_at,
              (t.owner_id=$2) AS is_owner
       FROM topics t
       LEFT JOIN topic_shares s ON s.topic_id=t.id AND s.recipient_id=$2
       WHERE t.id=$1 AND (t.owner_id=$2 OR s.id IS NOT NULL)`,
      [id, userId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    const offset = Number(req.headers["x-timezone-offset"] ?? 0);
    await recordLearningEvent(userId, "view_topic", 1, { topic_id: id }, Number.isFinite(offset) ? offset : 0);
    return res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

topicsRouter.get("/:id/stats", requireAuth, requireRole("teacher"), async (req: any, res) => {
  const userId = req.user.sub;
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  try {
    const topic = await pool.query("SELECT 1 FROM topics WHERE id=$1 AND owner_id=$2", [id, userId]);
    if (!topic.rowCount) return res.status(404).json({ error: "A téma nem található." });
    const quizStats = await pool.query(
      `SELECT q.id,q.title,COUNT(a.id)::int AS attempts,COUNT(DISTINCT a.user_id)::int AS students,
              COALESCE(ROUND(AVG(a.score)),0)::int AS avg_score
       FROM quizzes q LEFT JOIN attempts a ON a.quiz_id=q.id
       WHERE q.topic_id=$1 GROUP BY q.id,q.title ORDER BY q.created_at DESC`, [id]
    );
    const packStats = await pool.query(
      `SELECT p.id,p.title,COUNT(DISTINCT c.id)::int AS cards,
              COUNT(DISTINCT r.user_id)::int AS students,COALESCE(SUM(r.review_count),0)::int AS reviews,
              COALESCE(ROUND(100.0*SUM(r.correct_count)/NULLIF(SUM(r.review_count),0)),0)::int AS success_rate
       FROM flashcard_packs p LEFT JOIN flashcards c ON c.pack_id=p.id LEFT JOIN flashcard_reviews r ON r.card_id=c.id
       WHERE p.topic_id=$1 GROUP BY p.id,p.title ORDER BY p.created_at DESC`, [id]
    );
    res.json({ quizzes: quizStats.rows, packs: packStats.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a témastatisztikát." });
  }
});

topicsRouter.post("/", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = TopicSchema.parse(req.body);
  try {
    const r = await pool.query(
      `INSERT INTO topics(owner_id, name, description, subject, grade, color)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING id, name, description, subject, grade, color, created_at`,
      [
        userId,
        body.name.trim(),
        body.description ?? null,
        body.subject ?? null,
        req.user.role === "teacher" ? body.grade ?? null : null,
        body.color ?? null,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

topicsRouter.put("/:id", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const body = TopicSchema.partial().parse(req.body);
  try {
    const r = await pool.query(
      `UPDATE topics
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           subject = COALESCE($3, subject),
           grade = COALESCE($4, grade),
           color = COALESCE($5, color)
       WHERE id=$6 AND owner_id=$7
       RETURNING id, name, description, subject, grade, color, created_at`,
      [
        body.name?.trim(),
        body.description ?? null,
        body.subject ?? null,
        body.grade ?? null,
        body.color ?? null,
        id,
        userId,
      ]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found or not yours" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

topicsRouter.delete("/:id", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  try {
    const r = await pool.query("DELETE FROM topics WHERE id=$1 AND owner_id=$2", [id, userId]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found or not yours" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Share topic
topicsRouter.post("/:id/share", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

  const Body = z.object({
    recipients: z.array(z.string().email()).optional(),
    allow_reshare: z.boolean().optional(),
  }).optional();
  const body = Body?.parse(req.body ?? {}) ?? {};

  const own = await pool.query("select 1 from topics where id=$1 and owner_id=$2", [id, userId]);
  if (own.rowCount === 0) return res.status(404).json({ error: "Not found or not yours" });

  const allowReshare = !!body.allow_reshare;
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
      "insert into topic_shares(topic_id, token, shared_by, allow_reshare, parent_share_id) values($1,$2,$3,$4,$5)",
      [id, token, userId, allowReshare, null]
    );
    tokens.push({ token });
  } else {
    for (const recipient of recipientRows) {
      const token = nanoid(8);
      await pool.query(
        "insert into topic_shares(topic_id, token, recipient_id, shared_by, allow_reshare, parent_share_id) values($1,$2,$3,$4,$5,$6)",
        [id, token, recipient.id, userId, allowReshare, null]
      );
      tokens.push({ token, recipient_email: recipient.email });
    }
  }

  res.json({ tokens });
});

// Claim shared topic
topicsRouter.post("/share/claim", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const Body = z.object({ token: z.string().min(6) });
  const { token } = Body.parse(req.body);

  const s = await pool.query(
    "select id, topic_id, recipient_id, allow_reshare, shared_by, token from topic_shares where token=$1",
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
    "insert into topic_shares(topic_id, token, recipient_id, shared_by, allow_reshare, parent_share_id) values($1,$2,$3,$4,$5,$6)",
    [share.topic_id, newToken, userId, share.shared_by, share.allow_reshare, share.id]
  );

  res.json({ token: newToken });
});
