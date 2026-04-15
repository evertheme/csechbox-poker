import type { Card } from "./deck.js";
import { type HandResult } from "./hand-evaluator.js";
import type { BettingRound, GameConfig as BaseGameConfig, GamePhase } from "../types/index.js";
export type { BettingRound, GamePhase };
/** Limits + table display name (required when constructing from room UI). */
export interface GameConfig extends BaseGameConfig {
    name: string;
}
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
    readonly config: GameConfig;
    private deck;
    private players;
    private pot;
    /** Amount to match on this betting street (max of players’ street bets). */
    private currentBet;
    private currentRound;
    private phase;
    private currentPlayerIndex;
    private dealerPosition;
    private lastShowdownBest;
    private lastShowdownWinnerId;
    constructor(config: GameConfig);
    getPhase(): GamePhase;
    getPlayers(): readonly GamePlayer[];
    getPot(): number;
    /** Table stake to call on the current street. */
    getTableStake(): number;
    /** @deprecated alias — use `getTableStake()` */
    getStreetCap(): number;
    getCurrentRound(): BettingRound;
    getCurrentPlayerIndex(): number;
    getDealerPosition(): number;
    getLastShowdownBest(): HandResult | null;
    getLastShowdownWinnerId(): string | null;
    /** Rank value 2–14 for a single card (door / kicker logic). */
    getCardValue(card: Card): number;
    addPlayer(id: string, name: string, chips: number, position: number): void;
    removePlayer(id: string): void;
    setDealerPosition(index: number): void;
    startHand(): void;
    private collectAntes;
    /** Everyone still in the pot receives third-street cards (incl. all-in who still play). */
    private dealThirdStreet;
    private playersInHand;
    private getDoorCard;
    private compareDoorCards;
    private determineBringIn;
    private refreshTableStake;
    /** Third & fourth use small bet; fifth+ use big bet (standard stud structure). */
    private betIncrement;
    playerAction(playerId: string, type: PlayerActionType, amount?: number): void;
    private bettingComplete;
    private nextActivePlayer;
    private endBettingRound;
    private firstPlayerToAct;
    private dealStreet;
    private runShowdown;
    /** Advance dealer button for the next hand. */
    private rotateDealerAfterHand;
    /** Manual street advance (testing / simple orchestration). */
    advanceStreet(): void;
}
//# sourceMappingURL=stud-game.d.ts.map