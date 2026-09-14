const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
let isRedirecting = false;

export class ApiError extends Error {
  constructor(message: string, public status = 0, public retryable = false) {
    super(message);
    this.name = "ApiError";
  }
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const notifyError = (message: string) => window.dispatchEvent(new CustomEvent("mentora:error", { detail: message }));

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const maxAttempts = method === "GET" ? 3 : 1;
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const token = localStorage.getItem("mentora_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("X-Timezone-Offset")) headers.set("X-Timezone-Offset", String(new Date().getTimezoneOffset()));
    try {
      const response = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });
      if (response.status === 401) {
        if (!isRedirecting) {
          isRedirecting = true;
          localStorage.removeItem("mentora_token");
          localStorage.removeItem("mentora_user");
          if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/shared")) window.location.href = "/login";
        }
        throw new ApiError("A munkamenet lejárt. Jelentkezz be újra.", 401, false);
      }
      isRedirecting = false;
      if (response.status === 204) return null as T;
      if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try { message = (await response.json())?.error ?? message; } catch {}
        throw new ApiError(message, response.status, response.status >= 500 || response.status === 429);
      }
      const type = response.headers.get("content-type") ?? "";
      return (type.includes("application/json") ? await response.json() : await response.text()) as T;
    } catch (error) {
      lastError = error instanceof ApiError ? error : new ApiError("A szerver nem érhető el. Ellenőrizd a kapcsolatot és próbáld újra.", 0, true);
      if (!lastError.retryable || attempt === maxAttempts) break;
      await wait(300 * 2 ** (attempt - 1));
    }
  }
  const error = lastError ?? new ApiError("Ismeretlen hálózati hiba történt.");
  if (error.status !== 401) notifyError(error.message);
  throw error;
}
