import type { BettingRound, GameConfig, GamePhase } from "../types/index.js";
import { Deck } from "./deck.js";
/**
 * 7-card stud table state (skeleton — extend with seats, pots, and streets).
 */
export declare class StudGame {
    readonly config: GameConfig;
    phase: GamePhase;
    street: BettingRound;
    readonly deck: Deck;
    constructor(config: GameConfig);
    /** Advance to the next betting round (stub). */
    advanceStreet(): void;
}
//# sourceMappingURL=stud-game.d.ts.map