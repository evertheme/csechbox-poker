import type { Server, Socket } from "socket.io";
import { registerGameHandlers } from "./game-handler.js";
import { registerTableHandlers } from "./table-handler.js";

export function registerHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    registerTableHandlers(io, socket);
    registerGameHandlers(io, socket);
  });
}
