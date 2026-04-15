/** In-memory registry shared by socket handlers. */
export const rooms = new Map();
export function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
//# sourceMappingURL=live-room-store.js.map