export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  ts: string; // ISO timestamp
  level: LogLevel;
  msg: string;
  ctx?: Record<string, unknown>;
};

function emit(entry: LogEntry) {
  // Strukturált (JSON) log — böngésző konzolban is kereshető
  const line = JSON.stringify(entry);
  // eslint nélkül is ok: külön szintekhez külön console metódus
  if (entry.level === "error") console.error(line);
  else if (entry.level === "warn") console.warn(line);
  else if (entry.level === "debug") console.debug(line);
  else console.log(line);
}

export const logger = {
  debug(msg: string, ctx?: Record<string, unknown>) {
    emit({ ts: new Date().toISOString(), level: "debug", msg, ctx });
  },
  info(msg: string, ctx?: Record<string, unknown>) {
    emit({ ts: new Date().toISOString(), level: "info", msg, ctx });
  },
  warn(msg: string, ctx?: Record<string, unknown>) {
    emit({ ts: new Date().toISOString(), level: "warn", msg, ctx });
  },
  error(msg: string, ctx?: Record<string, unknown>) {
    emit({ ts: new Date().toISOString(), level: "error", msg, ctx });
  },
};
