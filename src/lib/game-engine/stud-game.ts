import type { Card, Rank, Suit, GamePhase, BettingRound } from "@/types/game";
import type { StudGameState } from "./types";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const BETTING_ROUND_SEQUENCE: BettingRound[] = [
  "third-street",
  "fourth-street",
  "fifth-street",
  "sixth-street",
  "seventh-street",
];

export function buildDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank): Card => ({ suit, rank, faceUp: false }))
  );
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

export function dealCard(state: StudGameState, faceUp: boolean): [Card, StudGameState] {
  const [card, ...remainingDeck] = state.deck;
  if (!card) throw new Error("Deck is empty");
  return [{ ...card, faceUp }, { ...state, deck: remainingDeck }];
}

export function nextGamePhase(current: GamePhase): GamePhase {
  const phases: GamePhase[] = ["waiting", "ante", "dealing", "betting", "showdown", "complete"];
  const idx = phases.indexOf(current);
  return phases[idx + 1] ?? "complete";
}

export function nextBettingRound(current: BettingRound | null): BettingRound | null {
  if (!current) return "third-street";
  const idx = BETTING_ROUND_SEQUENCE.indexOf(current);
  return BETTING_ROUND_SEQUENCE[idx + 1] ?? null;
}

export function getActivePlayers(state: StudGameState) {
  return state.players.filter((p) => !p.isFolded && !p.isAllIn);
}

export function calculatePot(state: StudGameState): number {
  return state.players.reduce((sum, p) => sum + p.totalBet, 0);
}
