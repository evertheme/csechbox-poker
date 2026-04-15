import { createServer } from "node:http";
import { Server } from "socket.io";
import { registerGameHandlers, registerRoomHandlers } from "./socket/handlers/index.js";
import { authMiddleware } from "./socket/middleware/auth-middleware.js";
import { createLogger } from "./utils/logger.js";
const logger = createLogger("index");
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
    transports: ["websocket"],
});
io.use(authMiddleware);
io.on("connection", (socket) => {
    logger.info(`connected: ${socket.id}`);
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    socket.on("disconnect", (reason) => {
        logger.info(`disconnected: ${socket.id} (${reason})`);
    });
});
httpServer.listen(PORT, () => {
    logger.info(`listening on :${PORT}`);
});
