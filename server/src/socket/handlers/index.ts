import type { Server, Socket } from "socket.io";
import { registerGameHandlers } from "./game-handler.js";
import { registerRoomHandlers } from "./room-handler.js";

export function registerHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
  });
}
