import type { Card, HandRanking } from "../types/index.js";
export declare enum HandRank {
    HIGH_CARD = 0,
    PAIR = 1,
    TWO_PAIR = 2,
    THREE_OF_KIND = 3,
    STRAIGHT = 4,
    FLUSH = 5,
    FULL_HOUSE = 6,
    FOUR_OF_KIND = 7,
    STRAIGHT_FLUSH = 8
}
export interface HandResult {
    rank: HandRank;
    name: string;
    cards: Card[];
    value: number;
    description: string;
}
export declare class HandEvaluator {
    private static readonly rankValues;
    static evaluate(cards: Card[]): HandResult;
    private static getBestHand;
    private static toHandResult;
    /** Higher is better. */
    private static encodeValue;
    private static scoreBetter;
    private static combinations5;
    private static isFlush;
    /** Sorted rank values; returns high card of straight or null. */
    private static straightHigh;
    private static evaluateFiveToScore;
}
/** Best 5-card high hand from 5–7 cards — maps to legacy `HandRanking` (rank 1 = best). */
export declare function evaluateSevenCardStud(cards: Card[]): HandRanking;
//# sourceMappingURL=hand-evaluator.d.ts.map