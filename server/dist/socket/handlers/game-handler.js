import { rooms } from "../../game/live-room-store.js";
import { createLogger } from "../../utils/logger.js";
const log = createLogger("game-handler");
function errMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
export function registerGameHandlers(io, socket) {
    socket.on("start-game", (roomId) => {
        try {
            const room = rooms.get(roomId);
            if (!room) {
                socket.emit("game:error", { message: "Room not found" });
                return;
            }
            room.phase = "ante";
            io.to(roomId).emit("game-started");
            console.log(`🎲 Game started in room: ${roomId}`);
            log.debug("start-game", { roomId });
        }
        catch (error) {
            socket.emit("game:error", { message: errMessage(error) });
        }
    });
    socket.on("player-action", (action) => {
        try {
            const { roomId, type, amount } = action;
            if (!rooms.has(roomId)) {
                socket.emit("game:error", { message: "Room not found" });
                return;
            }
            io.to(roomId).emit("player-action", {
                playerId: socket.data.userId ?? socket.id,
                type,
                amount,
                timestamp: new Date().toISOString(),
            });
            console.log(`🎯 Player action: ${type} in room ${roomId}`);
            log.debug("player-action", { roomId, type, amount });
        }
        catch (error) {
            socket.emit("game:error", { message: errMessage(error) });
        }
    });
    socket.on("sit-down", (roomId, _position, callback) => {
        if (typeof callback !== "function")
            return;
        try {
            const room = rooms.get(roomId);
            if (!room) {
                callback({ success: false, error: "Room not found" });
                return;
            }
            callback({ success: true });
            log.debug("sit-down", { roomId, position: _position });
        }
        catch (error) {
            callback({ success: false, error: errMessage(error) });
        }
    });
    socket.on("stand-up", (roomId) => {
        try {
            if (!rooms.has(roomId)) {
                socket.emit("game:error", { message: "Room not found" });
                return;
            }
            console.log(`🪑 Player stood up in room: ${roomId}`);
            log.debug("stand-up", { roomId });
        }
        catch (error) {
            socket.emit("game:error", { message: errMessage(error) });
        }
    });
    socket.on("send-message", (roomId, message) => {
        const username = socket.data.username ?? "Anonymous";
        io.to(roomId).emit("chat-message", {
            playerId: socket.data.userId ?? socket.id,
            username,
            text: message,
            timestamp: new Date().toISOString(),
        });
    });
}
//# sourceMappingURL=game-handler.js.map