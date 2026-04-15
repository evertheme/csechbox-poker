import type { Server, Socket } from "socket.io";
import type { GamePhase } from "../types/index.js";
import type { GameConfig as BaseGameConfig } from "../types/index.js";
import { StudGame, type GameConfig, type GamePlayer, type PlayerActionType } from "./stud-game.js";
export type { GameConfig, GamePlayer };
/** Input when creating a room (name + optional limit overrides). */
export type GameRoomCreateConfig = {
    name: string;
} & Partial<BaseGameConfig>;
export interface GameRoomState {
    id: string;
    phase: GamePhase;
    config: GameConfig;
    players: {
        userId: string;
        username: string;
    }[];
    game: {
        pot: number;
        currentRound: string;
        tableStake: number;
        currentPlayerId: string | null;
    };
}
export declare class GameRoom {
    readonly id: string;
    private readonly io;
    private game;
    private sockets;
    private playerNames;
    readonly config: GameConfig;
    constructor(id: string, input: GameRoomCreateConfig, io: Server);
    getStudGame(): StudGame;
    addPlayer(socket: Socket, userId: string, username: string): void;
    removePlayer(userId: string): void;
    startGame(): void;
    handlePlayerAction(userId: string, action: {
        type: PlayerActionType;
        amount?: number;
    }): void;
    hasPlayer(userId: string): boolean;
    getPlayerCount(): number;
    isEmpty(): boolean;
    isFull(): boolean;
    getState(): GameRoomState;
    private broadcast;
    private broadcastGameState;
}
//# sourceMappingURL=game-room.d.ts.map