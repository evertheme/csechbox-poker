import type { Server, Socket } from "socket.io";

export function registerAuthHandlers(_io: Server, socket: Socket): void {
  socket.on("disconnect", () => {
    console.log(`[auth] user ${socket.user?.userId ?? "unknown"} disconnected`);
  });
}
