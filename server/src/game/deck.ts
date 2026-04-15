import type { Card, Rank, Suit } from "../types/index.js";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  /** Build a full 52-card deck (all face-down). */
  reset(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({ suit, rank, faceUp: false });
      }
    }
  }

  /** Fisher–Yates shuffle (in place). */
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = this.cards[i];
      const b = this.cards[j];
      if (a === undefined || b === undefined) continue;
      this.cards[i] = b;
      this.cards[j] = a;
    }
  }

  deal(faceUp = false): Card | undefined {
    const c = this.cards.pop();
    if (!c) return undefined;
    return { ...c, faceUp };
  }

  remaining(): number {
    return this.cards.length;
  }

  /** Expose copy for tests / rigged deals (mutate carefully). */
  getCards(): readonly Card[] {
    return this.cards;
  }
}
