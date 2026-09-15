import { api } from "./http";

// ITT DEFINIÁLJUK A TÍPUST
export type UserRole = "teacher" | "student";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

export function registerApi(username: string, email: string, password: string, role: UserRole) {
  return api<{ token: string; user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, role }),
  });
}

export function loginApi(identifier: string, password: string) {
  return api<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function updateProfileApi(data: {
  username: string;
  email: string;
  current_password: string;
  new_password?: string;
}) {
  return api<{ token: string; user: AuthUser }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
