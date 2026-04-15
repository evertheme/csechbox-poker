export class Logger {
    static info(message, ...args) {
        console.log(`ℹ️  ${new Date().toISOString()} - ${message}`, ...args);
    }
    static error(message, ...args) {
        console.error(`❌ ${new Date().toISOString()} - ${message}`, ...args);
    }
    static warn(message, ...args) {
        console.warn(`⚠️  ${new Date().toISOString()} - ${message}`, ...args);
    }
    static success(message, ...args) {
        console.log(`✅ ${new Date().toISOString()} - ${message}`, ...args);
    }
    static debug(message, ...args) {
        if (process.env.NODE_ENV === "development") {
            console.log(`🐛 ${new Date().toISOString()} - ${message}`, ...args);
        }
    }
}
/** Scoped logger for modules (e.g. `createLogger("game-handler")`). */
export function createLogger(scope) {
    const prefix = `[${scope}]`;
    return {
        debug: (message, ...args) => Logger.debug(`${prefix} ${message}`, ...args),
        info: (message, ...args) => Logger.info(`${prefix} ${message}`, ...args),
        warn: (message, ...args) => Logger.warn(`${prefix} ${message}`, ...args),
        error: (message, ...args) => Logger.error(`${prefix} ${message}`, ...args),
    };
}
export const log = createLogger("server");
//# sourceMappingURL=logger.js.map