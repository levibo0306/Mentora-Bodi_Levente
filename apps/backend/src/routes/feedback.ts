import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { recordLearningEvent } from "../services/gamification";

export const feedbackRouter = Router();
const uuid = z.string().uuid();

async function resolvePair(user: any, partnerId: string) {
  const partner = await pool.query("SELECT id,username,email,role FROM users WHERE id=$1", [partnerId]);
  if (!partner.rowCount || partner.rows[0].role === user.role) return null;
  const pair = user.role === "teacher"
    ? { teacherId: user.sub, studentId: partnerId }
    : { teacherId: partnerId, studentId: user.sub };
  const relation = await pool.query(
    `SELECT 1 WHERE
       EXISTS (SELECT 1 FROM topic_shares ts JOIN topics t ON t.id=ts.topic_id WHERE ts.recipient_id=$2 AND t.owner_id=$1)
       OR EXISTS (SELECT 1 FROM quiz_shares qs JOIN quizzes q ON q.id=qs.quiz_id WHERE qs.recipient_id=$2 AND q.owner_id=$1)
       OR EXISTS (SELECT 1 FROM attempts a JOIN quizzes q ON q.id=a.quiz_id WHERE a.user_id=$2 AND q.owner_id=$1)
       OR EXISTS (SELECT 1 FROM feedback_messages f WHERE f.teacher_id=$1 AND f.student_id=$2)`,
    [pair.teacherId, pair.studentId]
  );
  return relation.rowCount ? pair : null;
}

feedbackRouter.get("/contacts", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const role = req.user.role;
  try {
    const result = role === "teacher"
      ? await pool.query(
          `SELECT DISTINCT u.id,u.username,u.email,u.role
           FROM users u WHERE u.role='student' AND (
             EXISTS (SELECT 1 FROM topic_shares ts JOIN topics t ON t.id=ts.topic_id WHERE ts.recipient_id=u.id AND t.owner_id=$1)
             OR EXISTS (SELECT 1 FROM quiz_shares qs JOIN quizzes q ON q.id=qs.quiz_id WHERE qs.recipient_id=u.id AND q.owner_id=$1)
             OR EXISTS (SELECT 1 FROM attempts a JOIN quizzes q ON q.id=a.quiz_id WHERE a.user_id=u.id AND q.owner_id=$1)
             OR EXISTS (SELECT 1 FROM feedback_messages f WHERE f.teacher_id=$1 AND f.student_id=u.id)
           ) ORDER BY u.username`, [userId])
      : await pool.query(
          `SELECT DISTINCT u.id,u.username,u.email,u.role
           FROM users u WHERE u.role='teacher' AND (
             EXISTS (SELECT 1 FROM topic_shares ts JOIN topics t ON t.id=ts.topic_id WHERE ts.recipient_id=$1 AND t.owner_id=u.id)
             OR EXISTS (SELECT 1 FROM quiz_shares qs JOIN quizzes q ON q.id=qs.quiz_id WHERE qs.recipient_id=$1 AND q.owner_id=u.id)
             OR EXISTS (SELECT 1 FROM feedback_messages f WHERE f.student_id=$1 AND f.teacher_id=u.id)
           ) ORDER BY u.username`, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a kapcsolatokat." });
  }
});

feedbackRouter.get("/:partnerId", requireAuth, async (req: any, res) => {
  const partnerId = uuid.parse(req.params.partnerId);
  const pair = await resolvePair(req.user, partnerId);
  if (!pair) return res.status(403).json({ error: "Érvénytelen kapcsolat." });
  try {
    const result = await pool.query(
      `SELECT f.id,f.message,f.topic_id,f.author_id,f.created_at,f.read_at,u.username AS author_name,t.name AS topic_name
       FROM feedback_messages f JOIN users u ON u.id=f.author_id LEFT JOIN topics t ON t.id=f.topic_id
       WHERE f.teacher_id=$1 AND f.student_id=$2 ORDER BY f.created_at`,
      [pair.teacherId, pair.studentId]
    );
    await pool.query(
      `UPDATE feedback_messages SET read_at=now() WHERE teacher_id=$1 AND student_id=$2 AND author_id<>$3 AND read_at IS NULL`,
      [pair.teacherId, pair.studentId, req.user.sub]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült betölteni a visszajelzéseket." });
  }
});

feedbackRouter.post("/:partnerId", requireAuth, async (req: any, res) => {
  const partnerId = uuid.parse(req.params.partnerId);
  const body = z.object({ message: z.string().trim().min(1).max(2000), topic_id: z.string().uuid().nullable().optional() }).parse(req.body);
  const pair = await resolvePair(req.user, partnerId);
  if (!pair) return res.status(403).json({ error: "Érvénytelen kapcsolat." });
  try {
    const result = await pool.query(
      `INSERT INTO feedback_messages(teacher_id,student_id,topic_id,author_id,message)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [pair.teacherId, pair.studentId, body.topic_id ?? null, req.user.sub, body.message]
    );
    const offset = Number(req.headers["x-timezone-offset"] ?? 0);
    await recordLearningEvent(req.user.sub, "send_feedback", 1, { partner_id: partnerId }, Number.isFinite(offset) ? offset : 0);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Nem sikerült elküldeni a visszajelzést." });
  }
});
