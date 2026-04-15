import type { GameRoom, GameConfig } from "../types/index.js";
export declare class GameRoomManager {
    private static instance;
    private rooms;
    static getInstance(): GameRoomManager;
    createRoom(name: string, hostId: string, options?: {
        isPrivate?: boolean;
        config?: Partial<GameConfig>;
    }): GameRoom;
    getRoom(id: string): GameRoom | undefined;
    listRooms(): GameRoom[];
    deleteRoom(id: string): void;
    updateRoom(id: string, patch: Partial<GameRoom>): GameRoom | undefined;
}
//# sourceMappingURL=game-room-manager.d.ts.map