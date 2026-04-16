import { GameRoom, } from "../../game/game-room.js";
import { generateTableId, tables } from "../../game/table-registry.js";
function errMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
export function registerTableHandlers(io, socket) {
    socket.on("create-table", (config, callback) => {
        if (typeof callback !== "function")
            return;
        try {
            const tableId = generateTableId();
            const table = new GameRoom(tableId, config, io);
            tables.set(tableId, table);
            console.log(`🎮 Table created: ${tableId}`);
            callback({
                success: true,
                tableId,
                message: "Table created successfully",
            });
        }
        catch (error) {
            callback({
                success: false,
                error: errMessage(error),
            });
        }
    });
    socket.on("join-table", (tableId, callback) => {
        if (typeof callback !== "function")
            return;
        try {
            const table = tables.get(tableId);
            if (!table) {
                throw new Error("Table not found");
            }
            const userId = socket.data.userId ?? socket.id;
            const username = socket.data.username ?? `Player_${userId.slice(0, 4)}`;
            table.addPlayer(socket, userId, username);
            void socket.join(tableId);
            console.log(`👤 ${username} joined table: ${tableId}`);
            callback({
                success: true,
                table: table.getState(),
                message: "Joined table successfully",
            });
        }
        catch (error) {
            callback({
                success: false,
                error: errMessage(error),
            });
        }
    });
    socket.on("leave-table", (tableId) => {
        try {
            const table = tables.get(tableId);
            if (!table)
                return;
            const userId = socket.data.userId ?? socket.id;
            table.removePlayer(userId);
            void socket.leave(tableId);
            console.log(`👋 Player left table: ${tableId}`);
            if (table.isEmpty()) {
                tables.delete(tableId);
                console.log(`🗑️ Table removed: ${tableId}`);
            }
        }
        catch (error) {
            console.error("Error leaving table:", error);
        }
    });
    socket.on("list-tables", (callback) => {
        if (typeof callback !== "function")
            return;
        const available = [...tables.values()]
            .filter((t) => !t.isFull())
            .map((t) => ({
            id: t.id,
            name: t.config.name,
            players: t.getPlayerCount(),
            maxPlayers: t.config.maxPlayers,
            config: t.config,
        }));
        callback({
            success: true,
            tables: available,
        });
    });
    socket.on("disconnect", () => {
        const userId = socket.data.userId ?? socket.id;
        for (const [tableId, table] of [...tables.entries()]) {
            if (table.hasPlayer(userId)) {
                table.removePlayer(userId);
                if (table.isEmpty()) {
                    tables.delete(tableId);
                    console.log(`🗑️ Table removed: ${tableId}`);
                }
            }
        }
    });
}
//# sourceMappingURL=table-handler.js.map