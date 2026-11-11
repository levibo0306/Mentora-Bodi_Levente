import "dotenv/config";
import "./instrument";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import * as Sentry from "@sentry/node";
import { healthcheck } from "./db";
import { authRouter } from "./routes/auth";
import { quizzesRouter } from "./routes/quizzes";
import { shareRouter } from "./routes/share";
import { usersRouter } from "./routes/users";
import { flashcardsRouter } from "./routes/flashcards";
import { topicsRouter } from "./routes/topics";
import { feedbackRouter } from "./routes/feedback";

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("A kérés originje nincs engedélyezve."));
    },
    credentials: true,
  })
);
app.use(express.json());
const metrics = { requests: 0, errors: 0 };

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
  } catch (error) {
    metrics.errors++;
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "health failed";
    res.status(500).json({ ok: false, error: message });
  }
});

app.get("/metrics", (_req, res) => res.json(metrics));

// API
app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api", shareRouter);
app.use("/api/users", usersRouter);
app.use("/api/flashcards", flashcardsRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/feedback", feedbackRouter);

// Error handler
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Érvénytelen JSON-adatok." });
    return;
  }
  metrics.errors++;
  Sentry.captureException(error);
  const message = error instanceof Error ? error.message : "server error";
  res.status(500).json({ error: message });
};
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}
