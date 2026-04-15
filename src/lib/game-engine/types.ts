import type { Card, GamePhase, PlayerAction } from "@/types/game";
import type { Player } from "@/types/player";

export interface HandResult {
  playerId: string;
  handRank: HandRank;
  handName: string;
  cards: Card[];
  score: number;
}

export type HandRank =
  | "royal-flush"
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "one-pair"
  | "high-card";

export interface StudGameState {
  phase: GamePhase;
  players: Player[];
  pot: number;
  sidePots: { amount: number; eligiblePlayerIds: string[] }[];
  currentPlayerId: string | null;
  deck: Card[];
  bringInPlayerId: string | null;
  lastRaisePlayerId: string | null;
  actionHistory: { playerId: string; action: PlayerAction; amount?: number; street: number }[];
}
