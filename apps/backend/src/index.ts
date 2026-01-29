
import "dotenv/config";
import "./instrument";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { pool, healthcheck } from "./db";
import * as Sentry from "@sentry/node";



const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));

const metrics = { requests: 0, errors: 0, quizzesCreated: 0 };

app.use((req, _res, next) => {
  metrics.requests++;
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: "info",
    event: "http.request",
    method: req.method,
    path: req.path
  }));
  next();
});

app.get("/health", async (_req, res) => {
  try { await healthcheck(); res.json({ ok: true }); }
  catch (e:any) { metrics.errors++; Sentry.captureException(e); res.status(500).json({ ok:false, error: e?.message ?? "health failed" }); }
});

app.get("/metrics", (_req, res) => res.json(metrics));

app.get("/api/quizzes", async (_req, res) => {
  try {
    const r = await pool.query("select id, title, created_at from quizzes order by created_at desc");
    res.json(r.rows);
  } catch (e:any) {
    metrics.errors++;
    Sentry.captureException(e);
    res.status(500).json({ error: e?.message ?? "list failed" });
  }
});

const CreateQuiz = z.object({ title: z.string().min(1).max(120) });

app.post("/api/quizzes", async (req, res) => {
  try {
    const { title } = CreateQuiz.parse(req.body);
    const r = await pool.query(
      "insert into quizzes(title) values($1) returning id, title, created_at",
      [title.trim()]
    );
    metrics.quizzesCreated++;
    console.log(JSON.stringify({ ts:new Date().toISOString(), level:"info", event:"quizzes.create.ok", quizId:r.rows[0].id }));
    res.status(201).json(r.rows[0]);
  } catch (e:any) {
    metrics.errors++;
    Sentry.captureException(e);
    res.status(400).json({ error: e?.message ?? "create failed" });
  }
});

app.use((err: any, _req: any, res: any, _next: any) => {
  metrics.errors++;
  res.status(500).json({ error: err?.message ?? "server error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
