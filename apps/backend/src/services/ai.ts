import { z } from "zod";

export interface GeneratedQuestion {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: number;
}

const GeneratedQuestionSchema = z.object({
  prompt: z.string().trim().min(5).max(500),
  options: z.array(z.string().trim().min(1).max(300)).length(4),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(1).max(1000),
  difficulty: z.number().int().min(1).max(5),
});

const GeneratedQuizSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(1).max(10),
});

const outputSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" },
          },
          correct_index: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" },
          difficulty: { type: "integer", minimum: 1, maximum: 5 },
        },
        required: ["prompt", "options", "correct_index", "explanation", "difficulty"],
      },
    },
  },
  required: ["questions"],
};

type OllamaChatResponse = {
  message?: { content?: string };
  error?: string;
};

export class AiServiceError extends Error {
  constructor(message: string, public readonly statusCode = 502) {
    super(message);
    this.name = "AiServiceError";
  }
}

export async function generateQuizFromText(textContext: string, count = 5, externalSignal?: AbortSignal): Promise<GeneratedQuestion[]> {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL ?? "qwen3:4b";
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS ?? 120_000);
  const contextSize = Math.min(8_192, Math.max(2_048, Number(process.env.OLLAMA_NUM_CTX ?? 4_096)));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        think: false,
        keep_alive: 0,
        format: outputSchema,
        options: {
          temperature: 0.15,
          num_ctx: contextSize,
          num_predict: Math.min(1_800, 220 + count * 150),
        },
        messages: [
          {
            role: "system",
            content: [
              "Magyar nyelvű oktatási kvízeket készítesz.",
              "Kizárólag a felhasználó által megadott forrásszövegből dolgozz.",
              "Természetes, mai magyar köznyelvet használj, helyes ékezetekkel és nyelvtannal.",
              "A kérdések önálló, teljes mondatok legyenek; kerüld a szó szerinti fordításokat és a körülményes megfogalmazást.",
              "Ne kezdd minden kérdést azzal, hogy 'A szöveg szerint', és ne utalj feltöltött szövegre vagy tananyagra.",
              "Minden kérdéshez pontosan négy, egymástól különböző válaszlehetőséget adj.",
              "A válaszlehetőségek legyenek rövidek, nyelvtanilag illeszkedjenek a kérdéshez, és tartozzanak azonos fogalmi kategóriába.",
              "A hibás válaszok legyenek hihetőek, de egyértelműen cáfolhatók a forrásszöveg alapján.",
              "Pontosan egy válasz legyen helyes. Ne találj ki a szövegben nem szereplő tényeket.",
              "A magyarázat röviden írja le, miért helyes a válasz.",
              "A difficulty értéke 1 és 5 közötti egész szám legyen.",
            ].join(" "),
          },
          {
            role: "user",
            content: `Készíts pontosan ${count} kérdést az alábbi tananyagból:\n\n${textContext}`,
          },
        ],
      }),
    });

    const payload = await response.json().catch(() => ({})) as OllamaChatResponse;
    if (!response.ok) {
      const detail = payload.error ? `: ${payload.error}` : "";
      throw new AiServiceError(`Az Ollama nem tudta lefuttatni a(z) ${model} modellt${detail}`, 503);
    }
    if (!payload.message?.content) {
      throw new AiServiceError("Az Ollama üres választ adott.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload.message.content);
    } catch {
      throw new AiServiceError("A modell válasza nem feldolgozható JSON.");
    }

    const result = GeneratedQuizSchema.safeParse(parsed);
    if (!result.success) {
      throw new AiServiceError("A modell válasza nem felel meg a kérdések kötelező formátumának.");
    }
    if (result.data.questions.length !== count) {
      throw new AiServiceError(`A modell ${count} helyett ${result.data.questions.length} kérdést készített.`);
    }

    return result.data.questions;
  } catch (error) {
    if (error instanceof AiServiceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiServiceError("Az AI-generálás túllépte az időkorlátot. Próbáld rövidebb szöveggel.", 504);
    }
    throw new AiServiceError(
      "Az Ollama nem érhető el. Indítsd el az Ollamát, és ellenőrizd, hogy a qwen3:4b modell le van töltve.",
      503,
    );
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}
