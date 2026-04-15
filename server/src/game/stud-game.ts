import type { Card, Rank, Suit } from "./deck.js";
import { Deck } from "./deck.js";
import { HandEvaluator, type HandResult } from "./hand-evaluator.js";
import type {
  BettingRound,
  GameConfig as BaseGameConfig,
  GamePhase,
} from "../types/index.js";

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

const RANK_VALUE: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const SUIT_ORDER: Record<Suit, number> = {
  clubs: 0,
  diamonds: 1,
  hearts: 2,
  spades: 3,
};

export class StudGame {
  private deck: Deck;
  private players: GamePlayer[] = [];
  private pot = 0;
  /** Amount to match on this betting street (max of players’ street bets). */
  private currentBet = 0;
  private currentRound: BettingRound = "third-street";
  private phase: GamePhase = "waiting";
  private currentPlayerIndex = 0;
  private dealerPosition = 0;

  private lastShowdownBest: HandResult | null = null;
  private lastShowdownWinnerId: string | null = null;

  constructor(public readonly config: GameConfig) {
    this.deck = new Deck();
  }

  // ─── getters ─────────────────────────────────────────────────────────────

  getPhase(): GamePhase {
    return this.phase;
  }

  getPlayers(): readonly GamePlayer[] {
    return this.players;
  }

  getPot(): number {
    return this.pot;
  }

  /** Table stake to call on the current street. */
  getTableStake(): number {
    return this.currentBet;
  }

  /** @deprecated alias — use `getTableStake()` */
  getStreetCap(): number {
    return this.currentBet;
  }

  getCurrentRound(): BettingRound {
    return this.currentRound;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  getDealerPosition(): number {
    return this.dealerPosition;
  }

  getLastShowdownBest(): HandResult | null {
    return this.lastShowdownBest;
  }

  getLastShowdownWinnerId(): string | null {
    return this.lastShowdownWinnerId;
  }

  /** Rank value 2–14 for a single card (door / kicker logic). */
  getCardValue(card: Card): number {
    return RANK_VALUE[card.rank];
  }

  // ─── seating ─────────────────────────────────────────────────────────────

  addPlayer(id: string, name: string, chips: number, position: number): void {
    if (this.players.length >= this.config.maxPlayers) {
      throw new Error("Game is full");
    }
    if (this.players.some((p) => p.id === id)) {
      throw new Error("Player already seated");
    }

    const player: GamePlayer = {
      id,
      name,
      chips,
      cards: [],
      currentBet: 0,
      totalBet: 0,
      isFolded: false,
      isAllIn: false,
      isActive: true,
      position,
    };
    this.players.push(player);
    this.players.sort((a, b) => a.position - b.position);
  }

  removePlayer(id: string): void {
    this.players = this.players.filter((p) => p.id !== id);
  }

  setDealerPosition(index: number): void {
    if (index >= 0 && index < this.players.length) {
      this.dealerPosition = index;
    }
  }

  // ─── hand lifecycle ───────────────────────────────────────────────────────

  startHand(): void {
    if (this.players.length < this.config.minPlayers) {
      throw new Error("Not enough players to start");
    }

    this.phase = "ante";
    this.pot = 0;
    this.currentBet = 0;
    this.currentRound = "third-street";
    this.lastShowdownBest = null;
    this.lastShowdownWinnerId = null;

    this.deck.reset();
    this.deck.shuffle();

    for (const player of this.players) {
      player.cards = [];
      player.currentBet = 0;
      player.totalBet = 0;
      player.isFolded = false;
      player.isAllIn = false;
      player.isActive = true;
    }

    this.collectAntes();
    this.phase = "dealing";
    this.dealThirdStreet();
    this.phase = "betting";
    this.determineBringIn();
    this.refreshTableStake();
  }

  private collectAntes(): void {
    for (const player of this.players) {
      const ante = this.config.ante;
      if (player.chips >= ante) {
        player.chips -= ante;
        this.pot += ante;
        player.totalBet += ante;
      } else {
        this.pot += player.chips;
        player.totalBet += player.chips;
        player.chips = 0;
        player.isAllIn = true;
      }
    }
  }

  /** Everyone still in the pot receives third-street cards (incl. all-in who still play). */
  private dealThirdStreet(): void {
    for (const player of this.players) {
      if (player.isFolded) continue;
      player.cards.push(...this.deck.deal(2, false));
      player.cards.push(...this.deck.deal(1, true));
    }
  }

  private playersInHand(): GamePlayer[] {
    return [...this.players]
      .filter((p) => !p.isFolded)
      .sort((a, b) => a.position - b.position);
  }

  private getDoorCard(player: GamePlayer): Card {
    const door = player.cards[2];
    if (!door) throw new Error("Missing door card");
    return door;
  }

  private compareDoorCards(a: Card, b: Card): number {
    const r1 = RANK_VALUE[a.rank];
    const s1 = SUIT_ORDER[a.suit];
    const r2 = RANK_VALUE[b.rank];
    const s2 = SUIT_ORDER[b.suit];
    if (r1 !== r2) return r1 - r2;
    return s1 - s2;
  }

  private determineBringIn(): void {
    const eligible = this.playersInHand().filter((p) => p.cards.length >= 3);
    if (eligible.length === 0) {
      throw new Error("No eligible players for bring-in");
    }

    let lowestPlayer = eligible[0]!;
    let lowestCard = this.getDoorCard(lowestPlayer);

    for (const player of eligible) {
      if (player.isFolded || player.isAllIn) continue;
      const door = this.getDoorCard(player);
      if (this.compareDoorCards(door, lowestCard) < 0) {
        lowestCard = door;
        lowestPlayer = player;
      }
    }

    this.currentPlayerIndex = this.players.findIndex((p) => p.id === lowestPlayer.id);

    const bring = Math.min(this.config.bringIn, lowestPlayer.chips);
    lowestPlayer.chips -= bring;
    lowestPlayer.currentBet = bring;
    lowestPlayer.totalBet += bring;
    this.pot += bring;
    if (lowestPlayer.chips === 0) lowestPlayer.isAllIn = true;
  }

  private refreshTableStake(): void {
    const alive = this.playersInHand();
    if (alive.length === 0) {
      this.currentBet = 0;
      return;
    }
    this.currentBet = Math.max(...alive.map((p) => p.currentBet));
  }

  /** Third & fourth use small bet; fifth+ use big bet (standard stud structure). */
  private betIncrement(): number {
    if (
      this.currentRound === "fifth-street" ||
      this.currentRound === "sixth-street" ||
      this.currentRound === "seventh-street"
    ) {
      return this.config.bigBet;
    }
    return this.config.smallBet;
  }

  // ─── player actions ──────────────────────────────────────────────────────

  playerAction(playerId: string, type: PlayerActionType, amount = 0): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.isFolded) return;
    if (this.phase !== "betting") return;

    const active = this.players[this.currentPlayerIndex];
    if (!active || active.id !== playerId) return;

    const stake = this.currentBet;

    switch (type) {
      case "fold":
        player.isFolded = true;
        player.isActive = false;
        break;
      case "check": {
        if (player.currentBet < stake) return;
        break;
      }
      case "call": {
        const toCall = stake - player.currentBet;
        const pay = Math.min(toCall, player.chips);
        player.chips -= pay;
        player.currentBet += pay;
        player.totalBet += pay;
        this.pot += pay;
        if (player.chips === 0) player.isAllIn = true;
        break;
      }
      case "bet":
      case "raise": {
        const inc = amount > 0 ? amount : this.betIncrement();
        const toCall = stake - player.currentBet;
        const totalDue = toCall + inc;
        const pay = Math.min(totalDue, player.chips);
        player.chips -= pay;
        player.currentBet += pay;
        player.totalBet += pay;
        this.pot += pay;
        if (player.chips === 0) player.isAllIn = true;
        break;
      }
      case "all-in": {
        const pay = player.chips;
        player.chips = 0;
        player.currentBet += pay;
        player.totalBet += pay;
        this.pot += pay;
        player.isAllIn = true;
        break;
      }
      default:
        return;
    }

    this.refreshTableStake();
    this.nextActivePlayer();

    if (this.bettingComplete()) {
      this.endBettingRound();
    }
  }

  private bettingComplete(): boolean {
    const alive = this.playersInHand();
    if (alive.length <= 1) return true;

    this.refreshTableStake();
    const cap = this.currentBet;
    return alive.every((p) => p.isAllIn || p.currentBet === cap);
  }

  private nextActivePlayer(): void {
    const n = this.players.length;
    for (let i = 1; i <= n; i++) {
      const idx = (this.currentPlayerIndex + i) % n;
      const p = this.players[idx]!;
      if (!p.isFolded && !p.isAllIn) {
        this.currentPlayerIndex = idx;
        return;
      }
    }
  }

  private endBettingRound(): void {
    for (const p of this.players) {
      p.currentBet = 0;
    }
    this.currentBet = 0;

    const order: BettingRound[] = [
      "third-street",
      "fourth-street",
      "fifth-street",
      "sixth-street",
      "seventh-street",
    ];
    const i = order.indexOf(this.currentRound);
    if (i < 0 || i >= order.length - 1) {
      this.phase = "showdown";
      this.runShowdown();
      return;
    }

    this.currentRound = order[i + 1]!;
    if (this.currentRound === "seventh-street") {
      this.dealStreet(false);
    } else {
      this.dealStreet(true);
    }
    this.phase = "betting";
    this.currentPlayerIndex = this.firstPlayerToAct();
    this.refreshTableStake();
  }

  private firstPlayerToAct(): number {
    const idx = this.players.findIndex((p) => !p.isFolded && !p.isAllIn);
    return idx >= 0 ? idx : 0;
  }

  private dealStreet(faceUp: boolean): void {
    for (const p of this.playersInHand()) {
      const c = this.deck.dealOne(faceUp);
      if (c) p.cards.push(c);
    }
  }

  private runShowdown(): void {
    const contenders = this.playersInHand().filter((p) => p.cards.length >= 5);
    let best: HandResult | null = null;
    let winnerId: string | null = null;

    for (const p of contenders) {
      try {
        const h = HandEvaluator.evaluate(p.cards);
        if (!best || h.value > best.value) {
          best = h;
          winnerId = p.id;
        }
      } catch {
        /* incomplete */
      }
    }

    this.lastShowdownBest = best;
    this.lastShowdownWinnerId = winnerId;
    this.phase = "complete";
    this.rotateDealerAfterHand();
  }

  /** Advance dealer button for the next hand. */
  private rotateDealerAfterHand(): void {
    if (this.players.length === 0) return;
    this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
  }

  /** Manual street advance (testing / simple orchestration). */
  advanceStreet(): void {
    const order: BettingRound[] = [
      "third-street",
      "fourth-street",
      "fifth-street",
      "sixth-street",
      "seventh-street",
    ];
    const i = order.indexOf(this.currentRound);
    if (i >= 0 && i < order.length - 1) {
      this.currentRound = order[i + 1]!;
      this.phase = "betting";
    } else {
      this.phase = "showdown";
    }
  }
}
