export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

/**
 * Player as embedded in `GameState.players` or wire DTOs (`name` / `avatar`).
 * For UI and Zustand, prefer {@link import("./player").Player} (`username` / `avatarUrl`).
 */
export interface GamePlayer {
  id: string;
  name: string;
  avatar?: string;
  chips: number;
  cards: Card[];
  currentBet: number;
  totalBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isActive: boolean;
  isConnected: boolean;
  position: number;
}

export interface GameConfig {
  /** Table display name when stored on room config (server-dependent). */
  name?: string;
  maxPlayers: number;
  minPlayers: number;
  ante: number;
  bringIn: number;
  smallBet: number;
  bigBet: number;
  buyIn: number;
  /** Per-turn time limit in seconds */
  timeLimit: number;
}

export type BettingRound =
  | "third-street"
  | "fourth-street"
  | "fifth-street"
  | "sixth-street"
  | "seventh-street";

export type GamePhase = "waiting" | "ante" | "dealing" | "betting" | "showdown" | "complete";

export interface Pot {
  amount: number;
  /** Player IDs eligible to win this pot */
  eligiblePlayers: string[];
}

/** All actions a player can take at the table (UI + engine). */
export type PlayerAction = "fold" | "check" | "call" | "bet" | "raise" | "all-in";

/**
 * Payload for client → server `player-action` (actor from socket session).
 * Distinct from {@link PlayerAction} string union used in UI state.
 */
export interface PlayerActionCommand {
  type: "fold" | "call" | "raise" | "check" | "bet" | "all-in";
  amount?: number;
}

export interface GameAction {
  type: PlayerAction;
  playerId: string;
  amount?: number;
  timestamp: Date;
}

/**
 * Full synchronized table state. `players` may be omitted when roster
 * is maintained separately (e.g. Zustand `players` slice).
 */
export interface GameState {
  id: string;
  players?: GamePlayer[];
  phase: GamePhase;
  currentRound: BettingRound | null;
  pot: number;
  sidePots: Pot[];
  currentBet: number;
  /** Some servers expose seat order; prefer `currentPlayerId` when present. */
  currentPlayerIndex?: number;
  currentPlayerId: string | null;
  dealerPosition: number;
  config: GameConfig;
  createdAt: Date;
  lastAction: GameAction | null;
}

/** Lobby-facing room summary (subset of full game state) */
export interface GameRoom {
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
  /** Lower is better (1 = royal flush) */
  rank: number;
  name: string;
  cards: Card[];
  description: string;
}
