import { StudGame } from "./stud-game.js";
const DEFAULT_CONFIG = {
    maxPlayers: 6,
    minPlayers: 2,
    ante: 5,
    bringIn: 10,
    smallBet: 20,
    bigBet: 40,
    buyIn: 500,
    timeLimit: 30,
};
export class GameRoom {
    id;
    config;
    io;
    players = new Map();
    stud = null;
    phase = "waiting";
    constructor(roomId, input, io) {
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
    addPlayer(socket, userId, username) {
        if (this.players.size >= this.config.maxPlayers) {
            throw new Error("Room is full");
        }
        if (this.players.has(userId)) {
            throw new Error("Player already in room");
        }
        this.players.set(userId, { userId, username, socketId: socket.id });
        this.emitUpdated();
    }
    removePlayer(userId) {
        this.players.delete(userId);
        this.emitUpdated();
    }
    emitUpdated() {
        this.io.to(this.id).emit("room:updated", this.getState());
    }
    hasPlayer(userId) {
        return this.players.has(userId);
    }
    getPlayerCount() {
        return this.players.size;
    }
    isEmpty() {
        return this.players.size === 0;
    }
    isFull() {
        return this.players.size >= this.config.maxPlayers;
    }
    getState() {
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
    ensureStud() {
        this.stud ??= new StudGame(this.config);
        return this.stud;
    }
}
//# sourceMappingURL=game-room.js.map