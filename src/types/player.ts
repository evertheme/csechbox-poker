import type { Card } from "./game";

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string;
  chips: number;
  cards: Card[];
  bet: number;
  totalBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isActive: boolean;
  seatIndex: number;
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
