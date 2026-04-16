import type { Server, Socket } from "socket.io";
import {
  GameRoom,
  type GameRoomCreateConfig,
} from "../../game/game-room.js";
import { generateTableId, tables } from "../../game/table-registry.js";

type AckFn<T> = (payload: T) => void;

function errMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerTableHandlers(io: Server, socket: Socket): void {
  socket.on(
    "create-table",
    (
      config: GameRoomCreateConfig,
      callback?: AckFn<
        | { success: true; tableId: string; message: string }
        | { success: false; error: string }
      >
    ) => {
      if (typeof callback !== "function") return;
      try {
        const tableId = generateTableId();
        const table = new GameRoom(tableId, config, io);
        tables.set(tableId, table);

        console.log(`🎮 Table created: ${tableId}`);

        callback({
          success: true,
          tableId,
          message: "Table created successfully",
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
    "join-table",
    (
      tableId: string,
      callback?: AckFn<
        | {
            success: true;
            table: ReturnType<GameRoom["getState"]>;
            message: string;
          }
        | { success: false; error: string }
      >
    ) => {
      if (typeof callback !== "function") return;
      try {
        const table = tables.get(tableId);

        if (!table) {
          throw new Error("Table not found");
        }

        const userId = socket.data.userId ?? socket.id;
        const username =
          socket.data.username ?? `Player_${userId.slice(0, 4)}`;

        table.addPlayer(socket, userId, username);
        void socket.join(tableId);

        console.log(`👤 ${username} joined table: ${tableId}`);

        callback({
          success: true,
          table: table.getState(),
          message: "Joined table successfully",
        });
      } catch (error: unknown) {
        callback({
          success: false,
          error: errMessage(error),
        });
      }
    }
  );

  socket.on("leave-table", (tableId: string) => {
    try {
      const table = tables.get(tableId);
      if (!table) return;

      const userId = socket.data.userId ?? socket.id;
      table.removePlayer(userId);
      void socket.leave(tableId);

      console.log(`👋 Player left table: ${tableId}`);

      if (table.isEmpty()) {
        tables.delete(tableId);
        console.log(`🗑️ Table removed: ${tableId}`);
      }
    } catch (error) {
      console.error("Error leaving table:", error);
    }
  });

  socket.on(
    "list-tables",
    (
      callback?: AckFn<{
        success: true;
        tables: {
          id: string;
          name: string;
          players: number;
          maxPlayers: number;
          config: GameRoom["config"];
        }[];
      }>
    ) => {
      if (typeof callback !== "function") return;
      const available = [...tables.values()]
        .filter((t) => !t.isFull())
        .map((t) => ({
          id: t.id,
          name: t.config.name,
          players: t.getPlayerCount(),
          maxPlayers: t.config.maxPlayers,
          config: t.config,
        }));

      callback({
        success: true,
        tables: available,
      });
    }
  );

  socket.on("disconnect", () => {
    const userId = socket.data.userId ?? socket.id;

    for (const [tableId, table] of [...tables.entries()]) {
      if (table.hasPlayer(userId)) {
        table.removePlayer(userId);

        if (table.isEmpty()) {
          tables.delete(tableId);
          console.log(`🗑️ Table removed: ${tableId}`);
        }
      }
    }
  });
}
