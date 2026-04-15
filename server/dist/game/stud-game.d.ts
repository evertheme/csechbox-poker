import type { BettingRound, GameConfig as TableGameConfig, GamePhase } from "../types/index.js";
import type { Card } from "./deck.js";
import { type HandResult } from "./hand-evaluator.js";
export type { BettingRound, GamePhase };
/** Table config: base limits + optional display name */
export type StudGameConfig = TableGameConfig & {
    name?: string;
};
export interface GamePlayer {
    id: string;
    name: string;
    chips: number;
    cards: Card[];
    currentBet: number;
    totalBet: number;
    isFolded: boolean;
    isAllIn: boolean;
    isActive: boolean;
    position: number;
}
export type PlayerActionType = "fold" | "check" | "call" | "bet" | "raise" | "all-in";
export declare class StudGame {
    readonly config: StudGameConfig;
    private deck;
    /** Best evaluated hand from the last `runShowdown` (winner not yet mapped to player id). */
    private lastShowdownBest;
    private players;
    private pot;
    /** Max chips put in this betting round (street) by any player */
    private streetCap;
    private currentRound;
    private phase;
    private currentPlayerIndex;
    constructor(config: StudGameConfig);
    getPhase(): GamePhase;
    getPlayers(): readonly GamePlayer[];
    getPot(): number;
    /** Target amount each player must match on this street (max of per-player street bets). */
    getStreetCap(): number;
    getCurrentRound(): BettingRound;
    getCurrentPlayerIndex(): number;
    getLastShowdownBest(): HandResult | null;
    addPlayer(id: string, name: string, chips: number, position: number): void;
    removePlayer(id: string): void;
    startHand(): void;
    private collectAntes;
    private playersInHand;
    private dealThirdStreet;
    private getDoorCard;
    private doorCardSortKey;
    private compareDoorCards;
    private determineBringIn;
    private refreshStreetCap;
    playerAction(playerId: string, type: PlayerActionType, amount?: number): void;
    private bettingComplete;
    private nextActivePlayer;
    private endBettingRound;
    private firstPlayerToAct;
    private dealStreet;
    private runShowdown;
    advanceStreet(): void;
}
//# sourceMappingURL=stud-game.d.ts.map