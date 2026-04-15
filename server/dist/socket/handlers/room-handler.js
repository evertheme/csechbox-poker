import { GameRoomManager } from "../../game/game-room-manager.js";
const manager = GameRoomManager.getInstance();
export function registerRoomHandlers(io, socket) {
    socket.on("room:list", () => {
        socket.emit("room:list", manager.listRooms());
    });
    socket.on("room:create", (name, payload) => {
        if (!socket.user)
            return;
        const room = manager.createRoom(name, socket.user.userId, {
            isPrivate: payload.isPrivate,
            config: payload.config,
        });
        io.emit("room:created", room);
    });
    socket.on("room:join", (roomId) => {
        if (!socket.user)
            return;
        const room = manager.getRoom(roomId);
        if (!room) {
            socket.emit("game:error", "Room not found");
            return;
        }
        socket.join(roomId);
        io.to(roomId).emit("room:updated", room);
    });
    socket.on("room:leave", (roomId) => {
        socket.leave(roomId);
    });
    socket.on("disconnect", () => {
        // Clean up rooms if needed
    });
}
//# sourceMappingURL=room-handler.js.map