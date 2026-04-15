import type { GameRoom, GamePhase, GameConfig } from "../types/index.js";

const DEFAULT_CONFIG: GameConfig = {
  maxPlayers: 6,
  minPlayers: 2,
  ante: 5,
  bringIn: 10,
  smallBet: 20,
  bigBet: 40,
  buyIn: 500,
  timeLimit: 30,
};

export class GameRoomManager {
  private static instance: GameRoomManager;
  private rooms = new Map<string, GameRoom>();

  static getInstance(): GameRoomManager {
    GameRoomManager.instance ??= new GameRoomManager();
    return GameRoomManager.instance;
  }

  createRoom(
    name: string,
    hostId: string,
    options: {
      isPrivate?: boolean;
      config?: Partial<GameConfig>;
    } = {}
  ): GameRoom {
    const id = crypto.randomUUID();
    const config: GameConfig = {
      ...DEFAULT_CONFIG,
      ...options.config,
    };
    const room: GameRoom = {
      id,
      name,
      hostId,
      playerCount: 1,
      phase: "waiting" as GamePhase,
      isPrivate: options.isPrivate ?? false,
      createdAt: new Date().toISOString(),
      config,
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): GameRoom | undefined {
    return this.rooms.get(id);
  }

  listRooms(): GameRoom[] {
    return [...this.rooms.values()];
  }

  deleteRoom(id: string): void {
    this.rooms.delete(id);
  }

  updateRoom(id: string, patch: Partial<GameRoom>): GameRoom | undefined {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    const updated = { ...room, ...patch };
    this.rooms.set(id, updated);
    return updated;
  }
}
