import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

export const shareRouter = Router();

// Teacher: create share link for a quiz
shareRouter.post("/quizzes/:id/share", requireAuth,  async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  const own = await pool.query("select 1 from quizzes where id=$1 and owner_id=$2", [id, userId]);
  if (own.rowCount === 0) return res.status(404).json({ error: "Not found" });

  const token = nanoid(16);
  await pool.query("insert into quiz_shares(quiz_id, token) values($1,$2)", [id, token]);
  res.json({ token });
});

// Student/public: get shared quiz by token
shareRouter.get("/share/:token", async (req, res) => {
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
shareRouter.post("/share/:token/submit", async (req, res) => {
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

  await pool.query("insert into attempts(quiz_id, user_id, answers, score) values($1,$2,$3,$4)", [
    quizId,
    null,
    JSON.stringify(answers),
    score,
  ]);

  res.json({ score, max: correct.rowCount });
});
