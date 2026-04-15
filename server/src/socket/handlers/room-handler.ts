import type { Server, Socket } from "socket.io";
import { GameRoomManager } from "../../game/game-room-manager.js";

const manager = GameRoomManager.getInstance();

export function registerRoomHandlers(io: Server, socket: Socket): void {
  socket.on("room:list" as never, () => {
    socket.emit("room:list", manager.listRooms() as never);
  });

  socket.on("room:create" as never, (name: string, payload: { config?: Record<string, unknown>; isPrivate?: boolean }) => {
    if (!socket.user) return;
    const room = manager.createRoom(name, socket.user.userId, {
      isPrivate: payload.isPrivate,
      config: payload.config as Partial<import("../../../src/types/game.js").GameConfig> | undefined,
    });
    io.emit("room:created", room as never);
  });

  socket.on("room:join" as never, (roomId: string) => {
    if (!socket.user) return;
    const room = manager.getRoom(roomId);
    if (!room) {
      socket.emit("game:error", "Room not found" as never);
      return;
    }
    socket.join(roomId);
    io.to(roomId).emit("room:updated", room as never);
  });

  socket.on("room:leave" as never, (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    // Clean up rooms if needed
  });
}
