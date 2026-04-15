import type { Card } from "./game";

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string;
  chips: number;
  cards: Card[];
  /** Bet placed in the current betting round */
  currentBet: number;
  /** Total bet across all rounds this hand */
  totalBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isActive: boolean;
  /** 0-based seat position at the table */
  position: number;
  isConnected: boolean;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  biggestPot: number;
  handsPlayed: number;
  handsFolded: number;
  /** Fraction 0–1 */
  winRate: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  chips: number;
  stats: PlayerStats;
  createdAt: Date;
  lastActive: Date;
}

export interface SeatPosition {
  position: number;
  player: Player | null;
  isOccupied: boolean;
}

/** Authenticated session user — stored in auth store */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  chips: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: string;
}
