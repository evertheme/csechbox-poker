import type { GameRoom } from "./game-room.js";

/** In-memory registry of active tables (socket handlers). */
export const tables = new Map<string, GameRoom>();

export function generateTableId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
