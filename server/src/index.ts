import { createServer } from "node:http";
import { Server } from "socket.io";
import { registerGameHandlers } from "./socket/handlers/game-handler.js";
import { registerRoomHandlers } from "./socket/handlers/room-handler.js";
import { authMiddleware } from "./socket/middleware/auth-middleware.js";

const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
  transports: ["websocket"],
});

io.use(authMiddleware);

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`[socket] disconnected: ${socket.id} (${reason})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
});
