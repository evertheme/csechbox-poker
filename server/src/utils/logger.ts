export class Logger {
  static info(message: string, ...args: unknown[]) {
    console.log(`ℹ️  ${new Date().toISOString()} - ${message}`, ...args);
  }

  static error(message: string, ...args: unknown[]) {
    console.error(`❌ ${new Date().toISOString()} - ${message}`, ...args);
  }

  static warn(message: string, ...args: unknown[]) {
    console.warn(`⚠️  ${new Date().toISOString()} - ${message}`, ...args);
  }

  static success(message: string, ...args: unknown[]) {
    console.log(`✅ ${new Date().toISOString()} - ${message}`, ...args);
  }

  static debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      console.log(`🐛 ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

/** Scoped logger for modules (e.g. `createLogger("game-handler")`). */
export function createLogger(scope: string) {
  const prefix = `[${scope}]`;
  return {
    debug: (message: string, ...args: unknown[]) =>
      Logger.debug(`${prefix} ${message}`, ...args),
    info: (message: string, ...args: unknown[]) =>
      Logger.info(`${prefix} ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) =>
      Logger.warn(`${prefix} ${message}`, ...args),
    error: (message: string, ...args: unknown[]) =>
      Logger.error(`${prefix} ${message}`, ...args),
  };
}

export const log = createLogger("server");
