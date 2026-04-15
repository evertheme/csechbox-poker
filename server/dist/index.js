import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { registerHandlers } from "./socket/handlers/index.js";
import { authMiddleware } from "./socket/middleware/auth-middleware.js";
dotenv.config();
const app = express();
const httpServer = createServer(app);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
// CORS configuration
app.use(cors({
    origin: clientUrl,
    credentials: true,
}));
// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: clientUrl,
        methods: ["GET", "POST"],
        credentials: true,
    },
    // Connection settings
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
});
// Socket middleware
io.use(authMiddleware);
// Register socket handlers
registerHandlers(io);
// Connection handler
io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    socket.on("disconnect", (reason) => {
        console.log(`❌ Client disconnected: ${socket.id} - ${reason}`);
    });
});
// Start server
const PORT = Number(process.env.PORT ?? 3001);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
});
// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    httpServer.close(() => {
        console.log("HTTP server closed");
    });
});
//# sourceMappingURL=index.js.map