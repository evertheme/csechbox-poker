import type { GameRoom } from "./game-room.js";

/** In-memory registry shared by socket handlers. */
export const rooms = new Map<string, GameRoom>();

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
