export declare class Logger {
    static info(message: string, ...args: unknown[]): void;
    static error(message: string, ...args: unknown[]): void;
    static warn(message: string, ...args: unknown[]): void;
    static success(message: string, ...args: unknown[]): void;
    static debug(message: string, ...args: unknown[]): void;
}
/** Scoped logger for modules (e.g. `createLogger("game-handler")`). */
export declare function createLogger(scope: string): {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
};
export declare const log: {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
};
//# sourceMappingURL=logger.d.ts.map