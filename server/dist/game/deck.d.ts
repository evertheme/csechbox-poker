import type { Card } from "../types/index.js";
export declare class Deck {
    private cards;
    constructor();
    /** Build a full 52-card deck (all face-down). */
    reset(): void;
    /** Fisher–Yates shuffle (in place). */
    shuffle(): void;
    deal(faceUp?: boolean): Card | undefined;
    remaining(): number;
    /** Expose copy for tests / rigged deals (mutate carefully). */
    getCards(): readonly Card[];
}
//# sourceMappingURL=deck.d.ts.map