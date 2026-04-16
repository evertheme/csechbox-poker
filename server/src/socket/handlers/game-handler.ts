import type { Server, Socket } from "socket.io";
import type { PlayerActionType } from "../../game/stud-game.js";
import { tables } from "../../game/table-registry.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("game-handler");

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerGameHandlers(io: Server, socket: Socket): void {
  socket.on("start-game", (tableId: string) => {
    try {
      const table = tables.get(tableId);
      if (!table) {
        socket.emit("game:error", { message: "Table not found" });
        return;
      }
      table.startGame();
      log.debug("start-game", { tableId });
    } catch (error: unknown) {
      socket.emit("game:error", { message: errMessage(error) });
    }
  });

  socket.on(
    "player-action",
    (action: { tableId: string; type: string; amount?: number }) => {
      try {
        const { tableId, type, amount } = action;
        const table = tables.get(tableId);
        if (!table) {
          socket.emit("game:error", { message: "Table not found" });
          return;
        }
        const userId = socket.data.userId ?? socket.id;
        table.handlePlayerAction(userId, {
          type: type as PlayerActionType,
          amount,
        });
        log.debug("player-action", { tableId, type, amount });
      } catch (error: unknown) {
        socket.emit("game:error", { message: errMessage(error) });
      }
    }
  );

  socket.on(
    "sit-down",
    (
      tableId: string,
      _position: number,
      callback?: (r: { success: true } | { success: false; error: string }) => void
    ) => {
      if (typeof callback !== "function") return;
      try {
        const table = tables.get(tableId);
        if (!table) {
          callback({ success: false, error: "Table not found" });
          return;
        }
        callback({ success: true });
        log.debug("sit-down", { tableId, position: _position });
      } catch (error: unknown) {
        callback({ success: false, error: errMessage(error) });
      }
    }
  );

  socket.on("stand-up", (tableId: string) => {
    try {
      if (!tables.has(tableId)) {
        socket.emit("game:error", { message: "Table not found" });
        return;
      }
      console.log(`🪑 Player stood up at table: ${tableId}`);
      log.debug("stand-up", { tableId });
    } catch (error: unknown) {
      socket.emit("game:error", { message: errMessage(error) });
    }
  });

  socket.on("send-message", (tableId: string, message: string) => {
    const username = socket.data.username ?? "Anonymous";

    io.to(tableId).emit("chat-message", {
      playerId: socket.data.userId ?? socket.id,
      username,
      text: message,
      timestamp: new Date().toISOString(),
    });
  });
}
