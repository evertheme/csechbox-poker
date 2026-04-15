import { rooms } from "../../game/live-room-store.js";
import { createLogger } from "../../utils/logger.js";
const log = createLogger("game-handler");
export function registerGameHandlers(io, socket) {
    socket.on("game:action", (action, amount) => {
        if (!socket.data.userId)
            return;
        const joined = [...socket.rooms].filter((r) => r !== socket.id);
        const roomId = joined[0];
        if (!roomId)
            return;
        const room = rooms.get(roomId);
        if (!room)
            return;
        io.to(roomId).emit("game:action", socket.data.userId, action, amount);
        log.debug("game:action relayed", { roomId, action, amount });
    });
}
//# sourceMappingURL=game-handler.js.map