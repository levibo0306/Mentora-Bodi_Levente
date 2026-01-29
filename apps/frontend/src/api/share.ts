import { api } from "./http";

export async function fetchShared(token: string) {
  const res = await api(`/api/share/${token}`, { method:"GET" });
  return res.json();
}
export async function submitShared(token: string, answers: Record<string, number>) {
  const res = await api(`/api/share/${token}/submit`, { method:"POST", body: JSON.stringify({ answers }) });
  return res.json(); // {score,max}
}
