/** Server-side game types (aligned with client `src/types/game.ts`). */

import type { Card, Rank, Suit } from "../game/deck.js";

/** Playing card + suit/rank — canonical definitions live in `../game/deck.ts`. */
export type { Card, Rank, Suit };

export type GamePhase =
  | "waiting"
  | "ante"
  | "dealing"
  | "betting"
  | "showdown"
  | "complete";

export type BettingRound =
  | "third-street"
  | "fourth-street"
  | "fifth-street"
  | "sixth-street"
  | "seventh-street";

export type PlayerAction = "fold" | "check" | "call" | "bet" | "raise" | "all-in";

export interface Pot {
  amount: number;
  eligiblePlayers: string[];
}

export interface GameConfig {
  maxPlayers: number;
  minPlayers: number;
  ante: number;
  bringIn: number;
  smallBet: number;
  bigBet: number;
  buyIn: number;
  timeLimit: number;
}

export interface GameAction {
  type: PlayerAction;
  playerId: string;
  amount?: number;
  timestamp: Date;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  currentRound: BettingRound | null;
  pot: number;
  sidePots: Pot[];
  currentBet: number;
  currentPlayerId: string | null;
  dealerPosition: number;
  config: GameConfig;
  createdAt: Date;
  lastAction: GameAction | null;
}

/** Lobby-facing room summary (DTO — not the runtime `GameRoom` class). */
export interface LobbyRoom {
  id: string;
  name: string;
  hostId: string;
  playerCount: number;
  phase: GamePhase;
  isPrivate: boolean;
  createdAt: string;
  config: GameConfig;
}

export interface HandRanking {
  /** Lower is better (1 = strongest category used here) */
  rank: number;
  name: string;
  cards: Card[];
  description: string;
}

/** Typed `socket.data` for auth/session (optional until handshake completes). */
export interface SocketData {
  userId?: string;
  username?: string;
}

/** Payload for creating a room (full table config). */
export interface CreateRoomData {
  name: string;
  maxPlayers: number;
  minPlayers: number;
  ante: number;
  bringIn: number;
  smallBet: number;
  bigBet: number;
  buyIn: number;
  timeLimit: number;
}

/** Ack payload for `join-room`. */
export interface JoinRoomResponse {
  success: boolean;
  room?: unknown;
  error?: string;
  message?: string;
}

/** Client → server `player-action` body. */
export interface PlayerActionData {
  roomId: string;
  type: "fold" | "call" | "raise" | "check" | "bet" | "all-in";
  amount?: number;
}

/** Socket auth payload attached in middleware */
export interface SocketUser {
  userId: string;
  username: string;
}
