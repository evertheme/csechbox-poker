type Level = "debug" | "info" | "warn" | "error";

function format(level: Level, scope: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const extra = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  return `[${ts}] [${level.toUpperCase()}] [${scope}] ${message}${extra}`;
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, meta?: unknown) =>
      console.debug(format("debug", scope, message, meta)),
    info: (message: string, meta?: unknown) =>
      console.info(format("info", scope, message, meta)),
    warn: (message: string, meta?: unknown) =>
      console.warn(format("warn", scope, message, meta)),
    error: (message: string, meta?: unknown) =>
      console.error(format("error", scope, message, meta)),
  };
}

export const log = createLogger("server");
