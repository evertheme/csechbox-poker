import { StudGame } from "./stud-game.js";
/**
 * Wraps lobby metadata with optional in-memory stud engine instance.
 */
export class GameRoomController {
    _room;
    _stud = null;
    constructor(room) {
        this._room = room;
    }
    get room() {
        return this._room;
    }
    startStud() {
        this._stud = new StudGame(this._room.config);
        return this._stud;
    }
    get activeGame() {
        return this._stud;
    }
}
//# sourceMappingURL=game-room.js.map