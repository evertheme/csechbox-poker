import { StudGame, } from "./stud-game.js";
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
    io;
    game;
    sockets = new Map();
    playerNames = new Map();
    config;
    constructor(id, input, io) {
        this.id = id;
        this.io = io;
        this.config = {
            ...DEFAULT_CONFIG,
            ...input,
            name: input.name,
            maxPlayers: input.maxPlayers ?? DEFAULT_CONFIG.maxPlayers,
            minPlayers: input.minPlayers ?? DEFAULT_CONFIG.minPlayers,
        };
        this.game = new StudGame(this.config);
    }
    getStudGame() {
        return this.game;
    }
    addPlayer(socket, userId, username) {
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
    removePlayer(userId) {
        const socket = this.sockets.get(userId);
        if (!socket)
            return;
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
    startGame() {
        if (this.sockets.size < this.config.minPlayers) {
            throw new Error(`Need at least ${this.config.minPlayers} players to start`);
        }
        this.game.startHand();
        this.broadcastGameState();
        this.broadcast("game-started", { message: "Game has started!" });
        console.log(`🎲 Game started in room ${this.id}`);
    }
    handlePlayerAction(userId, action) {
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
        }
        catch (error) {
            console.error("handlePlayerAction:", error);
            const sock = this.sockets.get(userId);
            sock?.emit("game:error", {
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    hasPlayer(userId) {
        return this.sockets.has(userId);
    }
    getPlayerCount() {
        return this.sockets.size;
    }
    isEmpty() {
        return this.sockets.size === 0;
    }
    isFull() {
        return this.sockets.size >= this.config.maxPlayers;
    }
    getState() {
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
    broadcast(event, payload) {
        this.io.to(this.id).emit(event, payload);
    }
    broadcastGameState() {
        const state = this.getState();
        this.io.to(this.id).emit("table:updated", state);
        this.io.to(this.id).emit("game-state", state);
    }
}
//# sourceMappingURL=game-room.js.map