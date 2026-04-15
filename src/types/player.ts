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
