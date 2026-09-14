import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryStorage } from "../../src/infra/storage";
import { clearQuizzes, loadQuizzes, saveQuizzes } from "../../src/infra/quizzesRepo";

describe("quizzesRepo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads quizzes from the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "1", title: "TESZT" },
        { id: "2", title: "KVÍZ" },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const quizzes = await loadQuizzes(createMemoryStorage());

    expect(fetchMock).toHaveBeenCalledWith("/api/quizzes");
    expect(quizzes).toHaveLength(2);
    expect(quizzes[0].title).toBe("TESZT");
  });

  it("returns an empty list for an API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(loadQuizzes(createMemoryStorage())).resolves.toEqual([]);
  });

  it("returns an empty list for a non-array response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    }));

    await expect(loadQuizzes(createMemoryStorage())).resolves.toEqual([]);
  });

  it("keeps saveQuizzes as an API-storage compatibility no-op", async () => {
    await expect(
      saveQuizzes(createMemoryStorage(), [{ id: "1", title: "TESZT" }])
    ).resolves.toBeUndefined();
  });

  it("rejects clearing all API-backed quizzes", async () => {
    await expect(clearQuizzes(createMemoryStorage())).rejects.toThrow(
      "clearQuizzes is not implemented for API storage"
    );
  });
});
