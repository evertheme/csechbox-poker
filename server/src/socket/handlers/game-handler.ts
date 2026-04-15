import type { Server, Socket } from "socket.io";
import { rooms } from "../../game/live-room-store.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("game-handler");

export function registerGameHandlers(io: Server, socket: Socket): void {
  socket.on("game:action" as never, (action: string, amount?: number) => {
    if (!socket.data.userId) return;

    const joined = [...socket.rooms].filter((r) => r !== socket.id);
    const roomId = joined[0];
    if (!roomId) return;

    const room = rooms.get(roomId);
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
