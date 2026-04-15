import type { Server } from "socket.io";
export { registerGameHandlers } from "./game-handler.js";
export { registerRoomHandlers } from "./room-handler.js";
/** Attach room + game socket handlers for each new connection. */
export declare function registerHandlers(io: Server): void;
//# sourceMappingURL=index.d.ts.map