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
export class GameRoomManager {
    static instance;
    rooms = new Map();
    static getInstance() {
        GameRoomManager.instance ??= new GameRoomManager();
        return GameRoomManager.instance;
    }
    createRoom(name, hostId, options = {}) {
        const id = crypto.randomUUID();
        const config = {
            ...DEFAULT_CONFIG,
            ...options.config,
        };
        const room = {
            id,
            name,
            hostId,
            playerCount: 1,
            phase: "waiting",
            isPrivate: options.isPrivate ?? false,
            createdAt: new Date().toISOString(),
            config,
        };
        this.rooms.set(id, room);
        return room;
    }
    getRoom(id) {
        return this.rooms.get(id);
    }
    listRooms() {
        return [...this.rooms.values()];
    }
    deleteRoom(id) {
        this.rooms.delete(id);
    }
    updateRoom(id, patch) {
        const room = this.rooms.get(id);
        if (!room)
            return undefined;
        const updated = { ...room, ...patch };
        this.rooms.set(id, updated);
        return updated;
    }
}
