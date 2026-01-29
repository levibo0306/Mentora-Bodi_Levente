import { api } from "./http";
import type { UserRole } from "../context/AuthContext";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export function registerApi(email: string, password: string, role: UserRole) {
  return api<{ token: string; user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export function loginApi(email: string, password: string) {
  return api<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
