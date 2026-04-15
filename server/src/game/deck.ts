export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Rank[] = [
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

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push({ suit, rank, faceUp: false });
      }
    }
  }

  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = this.cards[i];
      const b = this.cards[j];
      if (a === undefined || b === undefined) continue;
      this.cards[i] = b;
      this.cards[j] = a;
    }
  }

  deal(count = 1, faceUp = false): Card[] {
    const dealt = this.cards.splice(0, count);
    return dealt.map((card) => ({ ...card, faceUp }));
  }

  dealOne(faceUp = false): Card | null {
    const card = this.cards.shift();
    return card ? { ...card, faceUp } : null;
  }

  remaining(): number {
    return this.cards.length;
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
