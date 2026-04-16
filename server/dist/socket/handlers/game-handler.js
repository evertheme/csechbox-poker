import { tables } from "../../game/table-registry.js";
import { createLogger } from "../../utils/logger.js";
const log = createLogger("game-handler");
function errMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
export function registerGameHandlers(io, socket) {
    socket.on("start-game", (tableId) => {
        try {
            const table = tables.get(tableId);
            if (!table) {
                socket.emit("game:error", { message: "Table not found" });
                return;
            }
            table.startGame();
            log.debug("start-game", { tableId });
        }
        catch (error) {
            socket.emit("game:error", { message: errMessage(error) });
        }
    });
    socket.on("player-action", (action) => {
        try {
            const { tableId, type, amount } = action;
            const table = tables.get(tableId);
            if (!table) {
                socket.emit("game:error", { message: "Table not found" });
                return;
            }
            const userId = socket.data.userId ?? socket.id;
            table.handlePlayerAction(userId, {
                type: type,
                amount,
            });
            log.debug("player-action", { tableId, type, amount });
        }
        catch (error) {
            socket.emit("game:error", { message: errMessage(error) });
        }
    });
    socket.on("sit-down", (tableId, _position, callback) => {
        if (typeof callback !== "function")
            return;
        try {
            const table = tables.get(tableId);
            if (!table) {
                callback({ success: false, error: "Table not found" });
                return;
            }
            callback({ success: true });
            log.debug("sit-down", { tableId, position: _position });
        }
        catch (error) {
            callback({ success: false, error: errMessage(error) });
        }
    });
    socket.on("stand-up", (tableId) => {
        try {
            if (!tables.has(tableId)) {
                socket.emit("game:error", { message: "Table not found" });
                return;
            }
            console.log(`🪑 Player stood up at table: ${tableId}`);
            log.debug("stand-up", { tableId });
        }
        catch (error) {
            socket.emit("game:error", { message: errMessage(error) });
        }
    });
    socket.on("send-message", (tableId, message) => {
        const username = socket.data.username ?? "Anonymous";
        io.to(tableId).emit("chat-message", {
            playerId: socket.data.userId ?? socket.id,
            username,
            text: message,
            timestamp: new Date().toISOString(),
        });
    });
}
//# sourceMappingURL=game-handler.js.map