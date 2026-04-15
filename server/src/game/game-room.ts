import type { Server, Socket } from "socket.io";
import type { GameConfig, GamePhase } from "../types/index.js";
import { StudGame } from "./stud-game.js";

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

export type GameRoomCreateConfig = { name: string } & Partial<GameConfig>;

type Seat = {
  userId: string;
  username: string;
  socketId: string;
};

export class GameRoom {
  readonly id: string;
  readonly config: GameConfig & { name: string };
  private readonly io: Server;
  private readonly players = new Map<string, Seat>();
  private stud: StudGame | null = null;
  phase: GamePhase = "waiting";

  constructor(roomId: string, input: GameRoomCreateConfig, io: Server) {
    this.id = roomId;
    this.io = io;
    this.config = {
      ...DEFAULT_CONFIG,
      ...input,
      name: input.name,
      maxPlayers: input.maxPlayers ?? DEFAULT_CONFIG.maxPlayers,
      minPlayers: input.minPlayers ?? DEFAULT_CONFIG.minPlayers,
    };
  }

  addPlayer(socket: Socket, userId: string, username: string): void {
    if (this.players.size >= this.config.maxPlayers) {
      throw new Error("Room is full");
    }
    if (this.players.has(userId)) {
      throw new Error("Player already in room");
    }
    this.players.set(userId, { userId, username, socketId: socket.id });
    this.emitUpdated();
  }

  removePlayer(userId: string): void {
    this.players.delete(userId);
    this.emitUpdated();
  }

  private emitUpdated(): void {
    this.io.to(this.id).emit("room:updated", this.getState() as never);
  }

  hasPlayer(userId: string): boolean {
    return this.players.has(userId);
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  isFull(): boolean {
    return this.players.size >= this.config.maxPlayers;
  }

  getState(): {
    id: string;
    phase: GamePhase;
    config: GameConfig & { name: string };
    players: { userId: string; username: string }[];
  } {
    return {
      id: this.id,
      phase: this.phase,
      config: this.config,
      players: [...this.players.values()].map(({ userId, username }) => ({
        userId,
        username,
      })),
    };
  }

  /** Optional: start stud engine when table is ready */
  ensureStud(): StudGame {
    this.stud ??= new StudGame(this.config);
    return this.stud;
  }
}
