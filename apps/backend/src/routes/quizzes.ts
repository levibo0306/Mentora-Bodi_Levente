import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

export const quizzesRouter = Router();

quizzesRouter.get("/", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const r = await pool.query(
    `select id, title, description, created_at, updated_at
     from quizzes
     where owner_id = $1 or owner_id is null
     order by created_at desc`,
    [userId]
  );
  res.json(r.rows);
});

const CreateQuiz = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
});

quizzesRouter.post("/", requireAuth,  async (req: any, res) => {
  const { title, description } = CreateQuiz.parse(req.body);
  const userId = req.user.sub;

  const r = await pool.query(
    `insert into quizzes(owner_id, title, description)
     values($1,$2,$3)
     returning id, title, description, created_at, updated_at`,
    [userId, title.trim(), description ?? null]
  );
  res.status(201).json(r.rows[0]);
});

quizzesRouter.get("/:id", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  const r = await pool.query(
    `select id, title, description, created_at, updated_at
     from quizzes
     where id=$1 and (owner_id=$2)`,
    [id, userId]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

const UpdateQuiz = CreateQuiz.partial().refine((v) => Object.keys(v).length > 0, {
  message: "No fields to update",
});

quizzesRouter.put("/:id", requireAuth,  async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  const patch = UpdateQuiz.parse(req.body);

  const own = await pool.query("select 1 from quizzes where id=$1 and owner_id=$2", [id, userId]);
  if (own.rowCount === 0) return res.status(404).json({ error: "Not found" });

  const r = await pool.query(
    `update quizzes
     set title = coalesce($1, title),
         description = coalesce($2, description)
     where id=$3 and owner_id=$4
     returning id, title, description, created_at, updated_at`,
    [patch.title?.trim() ?? null, patch.description ?? null, id, userId]
  );

  res.json(r.rows[0]);
});

quizzesRouter.delete("/:id", requireAuth,  async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  const r = await pool.query("delete from quizzes where id=$1 and owner_id=$2 returning id", [id, userId]);
  if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });

  res.json({ ok: true });
});
