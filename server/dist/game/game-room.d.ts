import type { Server, Socket } from "socket.io";
import type { GamePhase } from "../types/index.js";
import type { GameConfig as BaseGameConfig } from "../types/index.js";
import { StudGame, type GameConfig as StudTableConfig, type PlayerActionType } from "./stud-game.js";
export type GameRoomCreateConfig = {
    name: string;
} & Partial<BaseGameConfig>;
export interface GameRoomState {
    id: string;
    phase: GamePhase;
    config: StudTableConfig;
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
    private readonly io;
    private readonly game;
    private readonly sockets;
    private readonly playerNames;
    readonly id: string;
    readonly config: StudTableConfig;
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