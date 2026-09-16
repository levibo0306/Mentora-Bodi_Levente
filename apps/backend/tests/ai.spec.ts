import { afterEach, describe, expect, test, vi } from "vitest";
import { generateQuizFromText } from "../src/services/ai";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.OLLAMA_MODEL;
  delete process.env.OLLAMA_API_KEY;
});

describe("Ollama integration", () => {
  test("uses a remote Ollama endpoint with bearer authentication", async () => {
    process.env.OLLAMA_BASE_URL = "https://ollama.example/api/";
    process.env.OLLAMA_MODEL = "cloud-model";
    process.env.OLLAMA_API_KEY = "secret-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          content: JSON.stringify({
            questions: [{
              prompt: "Melyik válasz szerepel a tananyagban?",
              options: ["Első", "Második", "Harmadik", "Negyedik"],
              correct_index: 0,
              explanation: "Az első válasz szerepel a forrásban.",
              difficulty: 2,
            }],
          }),
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateQuizFromText("Legalább ötven karakter hosszú tesztanyag a kérdés elkészítéséhez.", 1))
      .resolves.toHaveLength(1);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ollama.example/api/chat",
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer secret-key",
        },
      }),
    );
  });

  test("keeps local Ollama requests free of an authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "model missing" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateQuizFromText("Tesztanyag", 1)).rejects.toThrow("qwen3:4b");
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ "Content-Type": "application/json" });
  });
});
