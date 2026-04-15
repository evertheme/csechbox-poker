import type { Server, Socket } from "socket.io";
import { GameRoomManager } from "../../game/game-room-manager.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("game-handler");

const manager = GameRoomManager.getInstance();

export function registerGameHandlers(io: Server, socket: Socket): void {
  socket.on("game:action" as never, (action: string, amount?: number) => {
    if (!socket.data.userId) return;

    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    const roomId = rooms[0];
    if (!roomId) return;

    const room = manager.getRoom(roomId);
    if (!room) return;

    io.to(roomId).emit(
      "game:action",
      socket.data.userId as never,
      action as never,
      amount as never
    );
    log.debug("game:action relayed", { roomId, action, amount });
  });
}
