import type { Quiz } from "../core/quizLogic";
import type { StorageLike } from "./storage";

const API_BASE = "/api/quizzes";

/**
 * Régi API megmarad, de már nem localStorage-ból jön,
 * hanem backendből.
 */
export async function loadQuizzes(_storage: StorageLike): Promise<Quiz[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) return [];
  const data = (await res.json()) as Quiz[];
  return Array.isArray(data) ? data : [];
}

/**
 * Régen mentettünk, most DB a source of truth.
 * Prototípusban ezt noop-ra tesszük, hogy ne törjön a front.
 */
export async function saveQuizzes(_storage: StorageLike, _quizzes: Quiz[]): Promise<void> {
  // no-op: DB-ben a POST/DELETE kezeli a változást
}

/**
 * Ha a front hívja, jelezzük, hogy ez nincs implementálva,
 * vagy csinálhatunk backend "DELETE ALL"-t később.
 */
export async function clearQuizzes(_storage: StorageLike): Promise<void> {
  throw new Error("clearQuizzes is not implemented for API storage");
}
