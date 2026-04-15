import type { GameRoom } from "../types/index.js";
import { StudGame } from "./stud-game.js";

/**
 * Wraps lobby metadata with optional in-memory stud engine instance.
 */
export class GameRoomController {
  private readonly _room: GameRoom;
  private _stud: StudGame | null = null;

  constructor(room: GameRoom) {
    this._room = room;
  }

  get room(): GameRoom {
    return this._room;
  }

  startStud(): StudGame {
    this._stud = new StudGame(this._room.config);
    return this._stud;
  }

  get activeGame(): StudGame | null {
    return this._stud;
  }
}
