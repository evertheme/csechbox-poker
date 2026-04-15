import type { GameRoom } from "../types/index.js";
import { StudGame } from "./stud-game.js";
/**
 * Wraps lobby metadata with optional in-memory stud engine instance.
 */
export declare class GameRoomController {
    private readonly _room;
    private _stud;
    constructor(room: GameRoom);
    get room(): GameRoom;
    startStud(): StudGame;
    get activeGame(): StudGame | null;
}
//# sourceMappingURL=game-room.d.ts.map