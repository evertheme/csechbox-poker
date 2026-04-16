import type { Server, Socket } from "socket.io";
import type { GamePhase } from "../types/index.js";
import type { GameConfig as BaseGameConfig } from "../types/index.js";
import {
  StudGame,
  type GameConfig,
  type GamePlayer,
  type PlayerActionType,
} from "./stud-game.js";

export type { GameConfig, GamePlayer };

const DEFAULT_CONFIG: BaseGameConfig = {
  maxPlayers: 6,
  minPlayers: 2,
  ante: 5,
  bringIn: 10,
  smallBet: 20,
  bigBet: 40,
  buyIn: 500,
  timeLimit: 30,
};

/** Input when creating a room (name + optional limit overrides). */
export type GameRoomCreateConfig = { name: string } & Partial<BaseGameConfig>;

export interface GameRoomState {
  id: string;
  phase: GamePhase;
  config: GameConfig;
  players: { userId: string; username: string }[];
  game: {
    pot: number;
    currentRound: string;
    tableStake: number;
    currentPlayerId: string | null;
  };
}

export class GameRoom {
  private game: StudGame;
  private sockets: Map<string, Socket> = new Map();
  private playerNames: Map<string, string> = new Map();

  public readonly config: GameConfig;

  constructor(
    public readonly id: string,
    input: GameRoomCreateConfig,
    private readonly io: Server
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...input,
      name: input.name,
      maxPlayers: input.maxPlayers ?? DEFAULT_CONFIG.maxPlayers,
      minPlayers: input.minPlayers ?? DEFAULT_CONFIG.minPlayers,
    };
    this.game = new StudGame(this.config);
  }

  getStudGame(): StudGame {
    return this.game;
  }

  addPlayer(socket: Socket, userId: string, username: string): void {
    if (this.sockets.has(userId)) {
      throw new Error("Player already in room");
    }

    if (this.sockets.size >= this.config.maxPlayers) {
      throw new Error("Room is full");
    }

    this.sockets.set(userId, socket);
    this.playerNames.set(userId, username);

    const position = this.sockets.size - 1;
    this.game.addPlayer(userId, username, this.config.buyIn, position);

    this.broadcastGameState();
    this.broadcast("player-joined", {
      id: userId,
      name: username,
      position,
    });

    console.log(`✅ ${username} joined room ${this.id}`);
  }

  removePlayer(userId: string): void {
    const socket = this.sockets.get(userId);
    if (!socket) return;

    this.sockets.delete(userId);
    const username = this.playerNames.get(userId);
    this.playerNames.delete(userId);

    this.game.removePlayer(userId);

    this.broadcast("player-left", {
      id: userId,
      name: username ?? userId,
    });
    this.broadcastGameState();

    console.log(`❌ ${username ?? userId} left room ${this.id}`);
  }

  startGame(): void {
    if (this.sockets.size < this.config.minPlayers) {
      throw new Error(
        `Need at least ${this.config.minPlayers} players to start`
      );
    }

    this.game.startHand();
    this.broadcastGameState();
    this.broadcast("game-started", { message: "Game has started!" });

    console.log(`🎲 Game started in room ${this.id}`);
  }

  handlePlayerAction(
    userId: string,
    action: { type: PlayerActionType; amount?: number }
  ): void {
    try {
      this.game.playerAction(userId, action.type, action.amount);

      this.broadcast("player-action", {
        playerId: userId,
        action: action.type,
        amount: action.amount,
        timestamp: new Date().toISOString(),
      });

      this.broadcastGameState();

      const current = this.game.getCurrentPlayer();
      if (current) {
        const sock = this.sockets.get(current.id);
        sock?.emit("your-turn", {
          roomId: this.id,
          playerId: current.id,
        });
      }

      this.io.to(this.id).emit("turn-changed", {
        currentPlayerId: this.game.getCurrentPlayer()?.id ?? null,
      });
    } catch (error: unknown) {
      console.error("handlePlayerAction:", error);
      const sock = this.sockets.get(userId);
      sock?.emit("game:error", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  hasPlayer(userId: string): boolean {
    return this.sockets.has(userId);
  }

  getPlayerCount(): number {
    return this.sockets.size;
  }

  isEmpty(): boolean {
    return this.sockets.size === 0;
  }

  isFull(): boolean {
    return this.sockets.size >= this.config.maxPlayers;
  }

  getState(): GameRoomState {
    return {
      id: this.id,
      phase: this.game.getPhase(),
      config: this.config,
      players: [...this.playerNames.entries()].map(([userId, username]) => ({
        userId,
        username,
      })),
      game: {
        pot: this.game.getPot(),
        currentRound: this.game.getCurrentRound(),
        tableStake: this.game.getTableStake(),
        currentPlayerId: this.game.getCurrentPlayer()?.id ?? null,
      },
    };
  }

  private broadcast(event: string, payload: unknown): void {
    this.io.to(this.id).emit(event as never, payload as never);
  }

  private broadcastGameState(): void {
    const state = this.getState();
    this.io.to(this.id).emit("table:updated", state as never);
    this.io.to(this.id).emit("game-state", state as never);
  }
}
