import { registerGameHandlers } from "./game-handler.js";
import { registerRoomHandlers } from "./room-handler.js";
export { registerGameHandlers } from "./game-handler.js";
export { registerRoomHandlers } from "./room-handler.js";
/** Attach room + game socket handlers for each new connection. */
export function registerHandlers(io) {
    io.on("connection", (socket) => {
        registerRoomHandlers(io, socket);
        registerGameHandlers(io, socket);
    });
}
//# sourceMappingURL=index.js.map