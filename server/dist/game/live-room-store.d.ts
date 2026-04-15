import type { GameRoom } from "./game-room.js";
/** In-memory registry shared by socket handlers. */
export declare const rooms: Map<string, GameRoom>;
export declare function generateRoomId(): string;
//# sourceMappingURL=live-room-store.d.ts.map