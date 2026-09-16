# `services/ai.ts` leírása

Helyi Ollama/Qwen modellhez kapcsolódó kérdésgeneráló service. Zod sémával ellenőrzi, hogy minden generált kérdésnek van promptja, megfelelő válaszlistája, helyes indexe, magyarázata és 1–5 nehézsége. Az `ollamaConfig` környezeti változókból állítja össze a címet, modellt és timeoutot. A `generateQuizFromText` rendszer- és user promptot küld, JSON választ kér, kezeli a megszakítást/timeoutot, majd validált kérdéseket ad vissza. Az `AiServiceError` HTTP-kompatibilis hibakódot is hordoz.
