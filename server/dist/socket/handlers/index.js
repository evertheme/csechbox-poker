import { registerGameHandlers } from "./game-handler.js";
import { registerRoomHandlers } from "./room-handler.js";
export function registerHandlers(io) {
    io.on("connection", (socket) => {
        registerRoomHandlers(io, socket);
        registerGameHandlers(io, socket);
    });
}
//# sourceMappingURL=index.js.map