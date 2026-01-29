import "dotenv/config";
import "./instrument";
import express from "express";
import cors from "cors";
import * as Sentry from "@sentry/node";
import { healthcheck } from "./db";
import { authRouter } from "./routes/auth";
import { quizzesRouter } from "./routes/quizzes";
import { shareRouter } from "./routes/share";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
const metrics = { requests: 0, errors: 0, quizzesCreated: 0 };

app.use((req, _res, next) => {
  metrics.requests++;
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event: "http.request",
      method: req.method,
      path: req.path,
    })
  );
  next();
});

app.get("/health", async (_req, res) => {
  try {
    await healthcheck();
    res.json({ ok: true });
  } catch (e: any) {
    metrics.errors++;
    Sentry.captureException(e);
    res.status(500).json({ ok: false, error: e?.message ?? "health failed" });
  }
});

app.get("/metrics", (_req, res) => res.json(metrics));

// API
app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api", shareRouter);

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  metrics.errors++;
  Sentry.captureException(err);
  res.status(500).json({ error: err?.message ?? "server error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
