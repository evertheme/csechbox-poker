import type { Server, Socket } from "socket.io";
import {
  GameRoom,
  type GameRoomCreateConfig,
} from "../../game/game-room.js";
import { generateRoomId, rooms } from "../../game/live-room-store.js";

type AckFn<T> = (payload: T) => void;

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerRoomHandlers(io: Server, socket: Socket): void {
  socket.on(
    "create-room",
    (
      config: GameRoomCreateConfig,
      callback?: AckFn<
        | { success: true; roomId: string; message: string }
        | { success: false; error: string }
      >
    ) => {
      if (typeof callback !== "function") return;
      try {
        const roomId = generateRoomId();
        const room = new GameRoom(roomId, config, io);
        rooms.set(roomId, room);

        console.log(`🎮 Room created: ${roomId}`);

        callback({
          success: true,
          roomId,
          message: "Room created successfully",
        });
      } catch (error: unknown) {
        callback({
          success: false,
          error: errMessage(error),
        });
      }
    }
  );

  socket.on(
    "join-room",
    (
      roomId: string,
      callback?: AckFn<
        | {
            success: true;
            room: ReturnType<GameRoom["getState"]>;
            message: string;
          }
        | { success: false; error: string }
      >
    ) => {
      if (typeof callback !== "function") return;
      try {
        const room = rooms.get(roomId);

        if (!room) {
          throw new Error("Room not found");
        }

        const userId = socket.data.userId ?? socket.id;
        const username =
          socket.data.username ?? `Player_${userId.slice(0, 4)}`;

        room.addPlayer(socket, userId, username);
        void socket.join(roomId);

        console.log(`👤 ${username} joined room: ${roomId}`);

        callback({
          success: true,
          room: room.getState(),
          message: "Joined room successfully",
        });
      } catch (error: unknown) {
        callback({
          success: false,
          error: errMessage(error),
        });
      }
    }
  );

  socket.on("leave-room", (roomId: string) => {
    try {
      const room = rooms.get(roomId);
      if (!room) return;

      const userId = socket.data.userId ?? socket.id;
      room.removePlayer(userId);
      void socket.leave(roomId);

      console.log(`👋 Player left room: ${roomId}`);

      if (room.isEmpty()) {
        rooms.delete(roomId);
        console.log(`🗑️ Room deleted: ${roomId}`);
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  socket.on(
    "get-rooms",
    (
      callback?: AckFn<{
        success: true;
        rooms: {
          id: string;
          name: string;
          players: number;
          maxPlayers: number;
          config: GameRoom["config"];
        }[];
      }>
    ) => {
      if (typeof callback !== "function") return;
      const availableRooms = [...rooms.values()]
        .filter((room) => !room.isFull())
        .map((room) => ({
          id: room.id,
          name: room.config.name,
          players: room.getPlayerCount(),
          maxPlayers: room.config.maxPlayers,
          config: room.config,
        }));

      callback({
        success: true,
        rooms: availableRooms,
      });
    }
  );

  socket.on("disconnect", () => {
    const userId = socket.data.userId ?? socket.id;

    for (const [roomId, room] of [...rooms.entries()]) {
      if (room.hasPlayer(userId)) {
        room.removePlayer(userId);

        if (room.isEmpty()) {
          rooms.delete(roomId);
          console.log(`🗑️ Room deleted: ${roomId}`);
        }
      }
    }
  });
}
