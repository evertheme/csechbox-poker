function format(level, scope, message, meta) {
    const ts = new Date().toISOString();
    const extra = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
    return `[${ts}] [${level.toUpperCase()}] [${scope}] ${message}${extra}`;
}
export function createLogger(scope) {
    return {
        debug: (message, meta) => console.debug(format("debug", scope, message, meta)),
        info: (message, meta) => console.info(format("info", scope, message, meta)),
        warn: (message, meta) => console.warn(format("warn", scope, message, meta)),
        error: (message, meta) => console.error(format("error", scope, message, meta)),
    };
}
export const log = createLogger("server");
//# sourceMappingURL=logger.js.map