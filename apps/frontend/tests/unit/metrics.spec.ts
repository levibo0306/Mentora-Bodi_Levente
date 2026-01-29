import { describe, expect, it, beforeEach } from "vitest";
import { getMetrics, recordQuizCreated, recordRequest, _resetMetrics } from "../../src/infra/metrics";

describe("metrics", () => {
  beforeEach(() => {
    _resetMetrics();
  });

  it("tracks requests ok/fail", () => {
    recordRequest(true);
    recordRequest(false);
    const m = getMetrics();
    expect(m.requestsTotal).toBe(2);
    expect(m.requestsFailed).toBe(1);
    expect(m.lastErrorAt).toBeDefined();
  });

  it("tracks created quizzes", () => {
    recordQuizCreated();
    recordQuizCreated();
    const m = getMetrics();
    expect(m.quizzesCreated).toBe(2);
  });
});
