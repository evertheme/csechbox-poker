export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export type GamePhase =
  | "waiting"
  | "ante"
  | "third-street"
  | "fourth-street"
  | "fifth-street"
  | "sixth-street"
  | "seventh-street"
  | "showdown"
  | "ended";

export type PlayerAction = "fold" | "check" | "call" | "bet" | "raise";

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  playerCount: number;
  maxPlayers: number;
  ante: number;
  bringIn: number;
  smallBet: number;
  bigBet: number;
  phase: GamePhase;
  isPrivate: boolean;
  createdAt: string;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  pot: number;
  currentPlayerId: string | null;
  dealerId: string | null;
  communityCards: Card[];
  lastAction: { playerId: string; action: PlayerAction; amount?: number } | null;
}
