import type { Server, Socket } from "socket.io";
import type { GameConfig, GamePhase } from "../types/index.js";
import { StudGame } from "./stud-game.js";
export type GameRoomCreateConfig = {
    name: string;
} & Partial<GameConfig>;
export declare class GameRoom {
    readonly id: string;
    readonly config: GameConfig & {
        name: string;
    };
    private readonly io;
    private readonly players;
    private stud;
    phase: GamePhase;
    constructor(roomId: string, input: GameRoomCreateConfig, io: Server);
    addPlayer(socket: Socket, userId: string, username: string): void;
    removePlayer(userId: string): void;
    private emitUpdated;
    hasPlayer(userId: string): boolean;
    getPlayerCount(): number;
    isEmpty(): boolean;
    isFull(): boolean;
    getState(): {
        id: string;
        phase: GamePhase;
        config: GameConfig & {
            name: string;
        };
        players: {
            userId: string;
            username: string;
        }[];
    };
    /** Optional: start stud engine when table is ready */
    ensureStud(): StudGame;
}
//# sourceMappingURL=game-room.d.ts.map