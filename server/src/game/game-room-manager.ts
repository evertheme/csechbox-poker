import type { GameRoom, GamePhase } from "../../../src/types/game.js";

export class GameRoomManager {
  private static instance: GameRoomManager;
  private rooms = new Map<string, GameRoom>();

  static getInstance(): GameRoomManager {
    GameRoomManager.instance ??= new GameRoomManager();
    return GameRoomManager.instance;
  }

  createRoom(name: string, hostId: string, options: Partial<GameRoom> = {}): GameRoom {
    const id = crypto.randomUUID();
    const room: GameRoom = {
      id,
      name,
      hostId,
      playerCount: 1,
      maxPlayers: options.maxPlayers ?? 6,
      ante: options.ante ?? 5,
      bringIn: options.bringIn ?? 10,
      smallBet: options.smallBet ?? 20,
      bigBet: options.bigBet ?? 40,
      phase: "waiting" as GamePhase,
      isPrivate: options.isPrivate ?? false,
      createdAt: new Date().toISOString(),
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
