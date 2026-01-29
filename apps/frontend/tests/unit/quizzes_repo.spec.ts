import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "../../src/infra/storage";
import { loadQuizzes, saveQuizzes, clearQuizzes } from "../../src/infra/quizzesRepo";

describe("quizzesRepo", () => {
  it("starts empty", () => {
    const storage = createMemoryStorage();
    expect(loadQuizzes(storage)).toEqual([]);
  });

  it("saves and loads quizzes", () => {
    const storage = createMemoryStorage();
    saveQuizzes(storage, [
      { id: "1", title: "TESZT" },
      { id: "2", title: "KVÍZ" },
    ]);

    expect(loadQuizzes(storage)).toHaveLength(2);
    expect(loadQuizzes(storage)[0].title).toBe("TESZT");
  });

  it("clears quizzes", () => {
    const storage = createMemoryStorage();
    saveQuizzes(storage, [{ id: "1", title: "TESZT" }]);
    clearQuizzes(storage);
    expect(loadQuizzes(storage)).toEqual([]);
  });

  it("ignores invalid stored data", () => {
    const storage = createMemoryStorage();
    storage.setItem("mentora.quizzes.v1", JSON.stringify([{ nope: true }]));
    expect(loadQuizzes(storage)).toEqual([]);
  });
});
