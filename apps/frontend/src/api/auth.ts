import { api } from "./http";
import type { UserRole } from "../context/AuthContext";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export async function registerApi(email: string, password: string, role: UserRole) {
  const res = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  return res.json() as Promise<{ token: string; user: AuthUser }>;
}

export async function loginApi(email: string, password: string) {
  const res = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.json() as Promise<{ token: string; user: AuthUser }>;
}
