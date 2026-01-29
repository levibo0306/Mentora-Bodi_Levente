export type MetricsSnapshot = {
  requestsTotal: number;
  requestsFailed: number;
  quizzesCreated: number;
  lastErrorAt?: string;
};

const state: MetricsSnapshot = {
  requestsTotal: 0,
  requestsFailed: 0,
  quizzesCreated: 0,
};

export function recordRequest(ok: boolean, errorMessage?: string) {
  state.requestsTotal += 1;
  if (!ok) {
    state.requestsFailed += 1;
    state.lastErrorAt = new Date().toISOString();
    // errorMessage-t nem tároljuk tartósan (adatminimalizálás)
    void errorMessage;
  }
}

export function recordQuizCreated() {
  state.quizzesCreated += 1;
}

export function getMetrics(): MetricsSnapshot {
  return { ...state };
}

export function _resetMetrics() {
  state.requestsTotal = 0;
  state.requestsFailed = 0;
  state.quizzesCreated = 0;
  delete state.lastErrorAt;
}
