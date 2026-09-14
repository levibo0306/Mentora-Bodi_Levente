import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { recordLearningEvent } from "../services/gamification";

export const flashcardsRouter = Router();
const uuid = z.string().uuid();
const CardSchema = z.object({ front: z.string().trim().min(1).max(500), back: z.string().trim().min(1).max(2000) });
const PackSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  topic_id: z.string().uuid().nullable().optional(),
  cards: z.array(CardSchema).min(1).max(250),
});

async function canReadPack(packId: string, userId: string) {
  const result = await pool.query(
    `SELECT p.*, p.owner_id=$2 AS is_owner,
       EXISTS (SELECT 1 FROM topic_shares ts JOIN topics t ON t.id=ts.topic_id
               WHERE ts.topic_id=p.topic_id AND ts.recipient_id=$2 AND t.owner_id=p.owner_id) AS is_shared
     FROM flashcard_packs p WHERE p.id=$1`, [packId, userId]
  );
  const pack = result.rows[0];
  return pack && (pack.is_owner || pack.is_shared) ? pack : null;
}

flashcardsRouter.get("/packs", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const topicId = typeof req.query.topic_id === "string" ? uuid.parse(req.query.topic_id) : null;
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.topic_id, p.owner_id, p.created_at, p.updated_at,
              t.name AS topic_name, u.username AS owner_name,
              COUNT(DISTINCT c.id)::int AS card_count,
              COUNT(DISTINCT CASE WHEN r.user_id=$1 AND r.due_at<=now() THEN r.card_id END)::int AS due_count,
              COALESCE(SUM(CASE WHEN r.user_id=$1 THEN r.review_count ELSE 0 END),0)::int AS review_count
       FROM flashcard_packs p
       LEFT JOIN flashcards c ON c.pack_id=p.id
       LEFT JOIN flashcard_reviews r ON r.card_id=c.id AND r.user_id=$1
       LEFT JOIN topics t ON t.id=p.topic_id LEFT JOIN users u ON u.id=p.owner_id
       WHERE ($2::uuid IS NULL OR p.topic_id=$2)
         AND (p.owner_id=$1 OR EXISTS (SELECT 1 FROM topic_shares ts JOIN topics shared_topic ON shared_topic.id=ts.topic_id
                                      WHERE ts.topic_id=p.topic_id AND ts.recipient_id=$1 AND shared_topic.owner_id=p.owner_id))
       GROUP BY p.id, t.name, u.username ORDER BY p.updated_at DESC`, [userId, topicId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a kártyacsomagokat." });
  }
});

flashcardsRouter.get("/packs/:id", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const id = uuid.parse(req.params.id);
  try {
    const pack = await canReadPack(id, userId);
    if (!pack) return res.status(404).json({ error: "A kártyacsomag nem található." });
    const cards = await pool.query(
      `SELECT c.id, c.front, c.back, c.position,
              COALESCE(r.repetitions,0)::int AS repetitions,
              COALESCE(r.interval_days,0)::int AS interval_days,
              COALESCE(r.ease_factor,2.5)::float AS ease_factor,
              COALESCE(r.due_at,now()) AS due_at, COALESCE(r.review_count,0)::int AS review_count
       FROM flashcards c LEFT JOIN flashcard_reviews r ON r.card_id=c.id AND r.user_id=$2
       WHERE c.pack_id=$1 ORDER BY c.position, c.created_at`, [id, userId]
    );
    res.json({ ...pack, cards: cards.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a kártyacsomagot." });
  }
});

flashcardsRouter.post("/packs", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const body = PackSchema.parse(req.body);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO flashcard_packs(owner_id,topic_id,title,description) VALUES($1,$2,$3,$4) RETURNING *`,
      [userId, body.topic_id ?? null, body.title, body.description ?? null]
    );
    const pack = result.rows[0];
    for (const [position, card] of body.cards.entries()) {
      await client.query(
        `INSERT INTO flashcards(owner_id,topic_id,pack_id,front,back,position) VALUES($1,$2,$3,$4,$5,$6)`,
        [userId, body.topic_id ?? null, pack.id, card.front, card.back, position]
      );
    }
    await client.query("COMMIT");
    await recordLearningEvent(userId, "create_flashcard_pack", 1, { pack_id: pack.id });
    res.status(201).json({ ...pack, card_count: body.cards.length });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Nem sikerült létrehozni a kártyacsomagot." });
  } finally { client.release(); }
});

flashcardsRouter.post("/packs/import-quiz", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const { quiz_id, title } = z.object({ quiz_id: uuid, title: z.string().trim().min(2).max(120).optional() }).parse(req.body);
  const client = await pool.connect();
  try {
    const quizResult = await client.query(
      `SELECT q.* FROM quizzes q WHERE q.id=$1 AND (q.owner_id=$2 OR EXISTS
       (SELECT 1 FROM quiz_shares s WHERE s.quiz_id=q.id AND s.recipient_id=$2))`, [quiz_id, userId]
    );
    if (!quizResult.rowCount) return res.status(404).json({ error: "A kvíz nem érhető el." });
    const quiz = quizResult.rows[0];
    const questions = await client.query(
      "SELECT prompt,options,correct_index,explanation FROM questions WHERE quiz_id=$1 ORDER BY id", [quiz_id]
    );
    if (!questions.rowCount) return res.status(400).json({ error: "A kvízben nincs importálható kérdés." });
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO flashcard_packs(owner_id,topic_id,title,description) VALUES($1,$2,$3,$4) RETURNING *`,
      [userId, quiz.topic_id, title ?? `${quiz.title} - ismétlőkártyák`, "Kvízből automatikusan létrehozva."]
    );
    const pack = result.rows[0];
    for (const [position, question] of questions.rows.entries()) {
      const answer = question.options[question.correct_index];
      const back = question.explanation ? `${answer}\n\n${question.explanation}` : answer;
      await client.query(
        `INSERT INTO flashcards(owner_id,topic_id,pack_id,front,back,position) VALUES($1,$2,$3,$4,$5,$6)`,
        [userId, quiz.topic_id, pack.id, question.prompt, back, position]
      );
    }
    await client.query("COMMIT");
    await recordLearningEvent(userId, "import_quiz_cards", questions.rowCount ?? 0, { pack_id: pack.id });
    res.status(201).json({ ...pack, card_count: questions.rowCount });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Nem sikerült kártyacsomagot készíteni a kvízből." });
  } finally { client.release(); }
});

flashcardsRouter.post("/packs/:id/review", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const packId = uuid.parse(req.params.id);
  const { card_id, quality } = z.object({ card_id: uuid, quality: z.number().int().min(0).max(5) }).parse(req.body);
  try {
    if (!await canReadPack(packId, userId)) return res.status(404).json({ error: "A kártyacsomag nem található." });
    const card = await pool.query("SELECT 1 FROM flashcards WHERE id=$1 AND pack_id=$2", [card_id, packId]);
    if (!card.rowCount) return res.status(404).json({ error: "A kártya nem található." });
    const previous = await pool.query("SELECT * FROM flashcard_reviews WHERE user_id=$1 AND card_id=$2", [userId, card_id]);
    const old = previous.rows[0] ?? { repetitions: 0, interval_days: 0, ease_factor: 2.5 };
    const repetitions = quality < 3 ? 0 : old.repetitions + 1;
    const intervalDays = quality < 3 ? 1 : repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(old.interval_days * old.ease_factor));
    const easeFactor = Math.max(1.3, Number(old.ease_factor) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const dueAt = new Date(Date.now() + intervalDays * 86_400_000);
    const result = await pool.query(
      `INSERT INTO flashcard_reviews(user_id,card_id,pack_id,repetitions,interval_days,ease_factor,due_at,last_quality,review_count,correct_count)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,1,$9)
       ON CONFLICT(user_id,card_id) DO UPDATE SET repetitions=$4,interval_days=$5,ease_factor=$6,due_at=$7,last_quality=$8,
       review_count=flashcard_reviews.review_count+1,correct_count=flashcard_reviews.correct_count+$9,updated_at=now() RETURNING *`,
      [userId, card_id, packId, repetitions, intervalDays, easeFactor, dueAt, quality, quality >= 3 ? 1 : 0]
    );
    await recordLearningEvent(userId, "review_flashcard", 1, { pack_id: packId, quality });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült menteni az ismétlést." });
  }
});

flashcardsRouter.get("/packs/:id/stats", requireAuth, async (req: any, res) => {
  const id = uuid.parse(req.params.id);
  try {
    const owner = await pool.query("SELECT 1 FROM flashcard_packs WHERE id=$1 AND owner_id=$2", [id, req.user.sub]);
    if (!owner.rowCount) return res.status(403).json({ error: "Nincs jogosultságod a statisztikához." });
    const result = await pool.query(
      `SELECT u.id AS student_id,u.username,u.email,COUNT(DISTINCT r.card_id)::int AS cards_seen,
       COALESCE(SUM(r.review_count),0)::int AS reviews,
       COALESCE(ROUND(100.0*SUM(r.correct_count)/NULLIF(SUM(r.review_count),0)),0)::int AS success_rate,
       MAX(r.updated_at) AS last_studied
       FROM flashcard_reviews r JOIN users u ON u.id=r.user_id WHERE r.pack_id=$1 AND u.role='student'
       GROUP BY u.id,u.username,u.email ORDER BY last_studied DESC`, [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a statisztikát." });
  }
});

flashcardsRouter.delete("/packs/:id", requireAuth, async (req: any, res) => {
  const result = await pool.query("DELETE FROM flashcard_packs WHERE id=$1 AND owner_id=$2", [uuid.parse(req.params.id), req.user.sub]);
  if (!result.rowCount) return res.status(404).json({ error: "A kártyacsomag nem található." });
  res.json({ ok: true });
});
