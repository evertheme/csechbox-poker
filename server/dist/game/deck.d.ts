export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export interface Card {
    suit: Suit;
    rank: Rank;
    faceUp: boolean;
}
export declare class Deck {
    private cards;
    constructor();
    reset(): void;
    shuffle(): void;
    deal(count?: number, faceUp?: boolean): Card[];
    dealOne(faceUp?: boolean): Card | null;
    remaining(): number;
    isEmpty(): boolean;
}
//# sourceMappingURL=deck.d.ts.map