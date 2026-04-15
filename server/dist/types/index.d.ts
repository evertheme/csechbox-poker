/** Server-side game types (aligned with client `src/types/game.ts`). */
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export interface Card {
    suit: Suit;
    rank: Rank;
    faceUp: boolean;
}
export type GamePhase = "waiting" | "ante" | "dealing" | "betting" | "showdown" | "complete";
export type BettingRound = "third-street" | "fourth-street" | "fifth-street" | "sixth-street" | "seventh-street";
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
/** Socket auth payload attached in middleware */
export interface SocketUser {
    userId: string;
    username: string;
}
//# sourceMappingURL=index.d.ts.map