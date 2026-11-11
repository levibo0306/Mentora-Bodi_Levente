import { asyncRoute } from "../middleware/asyncRoute";
import { Router, type Response } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { AiServiceError, generateQuizFromText } from "../services/ai";
import { DocumentTextError, extractDocumentText } from "../services/documentText";

export const quizGenerationRouter = Router();

const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
}).single("file");

const textRequest = z.object({
  text: z.string().trim().min(50).max(7_000),
  count: z.number().int().min(1).max(10).default(5),
});

function requestAbortSignal(res: Response) {
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });
  return controller.signal;
}

quizGenerationRouter.post("/generate-ai", requireAuth, asyncRoute(async (req, res) => {
  try {
    const { text, count } = textRequest.parse(req.body);
    const questions = await generateQuizFromText(text, count, requestAbortSignal(res));
    res.json(questions);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "A tananyag vagy a kérdésszám hibás." });
    if (error instanceof AiServiceError) return res.status(error.statusCode).json({ error: error.message });
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Nem sikerült a kérdések generálása." });
  }
}));

quizGenerationRouter.post("/generate-ai-file", requireAuth, asyncRoute(async (req, res) => {
  try {
    await new Promise<void>((resolve, reject) => {
      uploadDocument(req, res, (error) => error ? reject(error) : resolve());
    });
    if (!req.file) return res.status(400).json({ error: "Válassz egy PDF vagy DOCX dokumentumot." });

    const count = z.coerce.number().int().min(1).max(10).default(5).parse(req.body.count);
    const source = await extractDocumentText(req.file.buffer, req.file.originalname, req.file.mimetype);
    const questions = await generateQuizFromText(source.text, count, requestAbortSignal(res));

    return res.json({
      questions,
      source: {
        filename: req.file.originalname,
        characters: source.originalCharacters,
        truncated: source.truncated,
      },
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        error: error.code === "LIMIT_FILE_SIZE"
          ? "A dokumentum legfeljebb 8 MB lehet."
          : "A dokumentum feltöltése sikertelen.",
      });
    }
    if (error instanceof z.ZodError) return res.status(400).json({ error: "A kérdésszám hibás." });
    if (error instanceof DocumentTextError) return res.status(error.statusCode).json({ error: error.message });
    if (error instanceof AiServiceError) return res.status(error.statusCode).json({ error: error.message });
    console.error("AI document error:", error);
    return res.status(500).json({ error: "Nem sikerült kérdéseket generálni a dokumentumból." });
  }
}));
