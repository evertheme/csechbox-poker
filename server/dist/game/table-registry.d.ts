import type { GameRoom } from "./game-room.js";
/** In-memory registry of active tables (socket handlers). */
export declare const tables: Map<string, GameRoom>;
export declare function generateTableId(): string;
//# sourceMappingURL=table-registry.d.ts.map