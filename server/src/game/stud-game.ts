import type {
  BettingRound,
  GameConfig as TableGameConfig,
  GamePhase,
} from "../types/index.js";
import type { Card, Rank, Suit } from "./deck.js";
import { Deck } from "./deck.js";
import { HandEvaluator, type HandResult } from "./hand-evaluator.js";

export type { BettingRound, GamePhase };

/** Table config: base limits + optional display name */
export type StudGameConfig = TableGameConfig & { name?: string };

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
  /** Best evaluated hand from the last `runShowdown` (winner not yet mapped to player id). */
  private lastShowdownBest: HandResult | null = null;
  private players: GamePlayer[] = [];
  private pot = 0;
  /** Max chips put in this betting round (street) by any player */
  private streetCap = 0;
  private currentRound: BettingRound = "third-street";
  private phase: GamePhase = "waiting";
  private currentPlayerIndex = 0;

  constructor(public readonly config: StudGameConfig) {
    this.deck = new Deck();
  }

  getPhase(): GamePhase {
    return this.phase;
  }

  getPlayers(): readonly GamePlayer[] {
    return this.players;
  }

  getPot(): number {
    return this.pot;
  }

  /** Target amount each player must match on this street (max of per-player street bets). */
  getStreetCap(): number {
    return this.streetCap;
  }

  getCurrentRound(): BettingRound {
    return this.currentRound;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  getLastShowdownBest(): HandResult | null {
    return this.lastShowdownBest;
  }

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

  startHand(): void {
    if (this.players.length < this.config.minPlayers) {
      throw new Error("Not enough players to start");
    }

    this.phase = "ante";
    this.pot = 0;
    this.streetCap = 0;
    this.currentRound = "third-street";
    this.deck.reset();
    this.deck.shuffle();

    for (const p of this.players) {
      p.cards = [];
      p.currentBet = 0;
      p.totalBet = 0;
      p.isFolded = false;
      p.isAllIn = false;
      p.isActive = true;
    }

    this.collectAntes();
    this.dealThirdStreet();
    this.phase = "betting";
    this.determineBringIn();
    this.refreshStreetCap();
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

  private playersInHand(): GamePlayer[] {
    return [...this.players]
      .filter((p) => !p.isFolded)
      .sort((a, b) => a.position - b.position);
  }

  private dealThirdStreet(): void {
    const order = this.playersInHand();
    for (const player of order) {
      player.cards.push(...this.deck.deal(2, false));
      player.cards.push(...this.deck.deal(1, true));
    }
  }

  private getDoorCard(player: GamePlayer): Card {
    const door = player.cards[2];
    if (!door) {
      throw new Error("Missing door card");
    }
    return door;
  }

  private doorCardSortKey(card: Card): [number, number] {
    return [RANK_VALUE[card.rank], SUIT_ORDER[card.suit]];
  }

  private compareDoorCards(a: Card, b: Card): number {
    const [r1, s1] = this.doorCardSortKey(a);
    const [r2, s2] = this.doorCardSortKey(b);
    if (r1 !== r2) return r1 - r2;
    return s1 - s2;
  }

  private determineBringIn(): void {
    const eligible = this.playersInHand().filter((p) => p.cards.length >= 3);
    if (eligible.length === 0) {
      throw new Error("No eligible players for bring-in");
    }

    let lowest = eligible[0]!;
    let lowestCard = this.getDoorCard(lowest);

    for (const p of eligible.slice(1)) {
      const c = this.getDoorCard(p);
      if (this.compareDoorCards(c, lowestCard) < 0) {
        lowest = p;
        lowestCard = c;
      }
    }

    this.currentPlayerIndex = this.players.findIndex((p) => p.id === lowest.id);
    const bring = Math.min(this.config.bringIn, lowest.chips);
    lowest.chips -= bring;
    lowest.currentBet = bring;
    lowest.totalBet += bring;
    this.pot += bring;
    if (lowest.chips === 0) lowest.isAllIn = true;
  }

  private refreshStreetCap(): void {
    const alive = this.playersInHand();
    if (alive.length === 0) {
      this.streetCap = 0;
      return;
    }
    this.streetCap = Math.max(...alive.map((p) => p.currentBet));
  }

  playerAction(playerId: string, type: PlayerActionType, amount = 0): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.isFolded) return;
    if (this.phase !== "betting") return;

    const active = this.players[this.currentPlayerIndex];
    if (!active || active.id !== playerId) return;

    switch (type) {
      case "fold":
        player.isFolded = true;
        player.isActive = false;
        break;
      case "check": {
        if (player.currentBet < this.streetCap) return;
        break;
      }
      case "call": {
        const toCall = this.streetCap - player.currentBet;
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
        const increment = amount > 0 ? amount : this.config.smallBet;
        const toCall = this.streetCap - player.currentBet;
        const totalDue = toCall + increment;
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

    this.refreshStreetCap();
    this.nextActivePlayer();

    if (this.bettingComplete()) {
      this.endBettingRound();
    }
  }

  private bettingComplete(): boolean {
    const alive = this.playersInHand();
    if (alive.length <= 1) return true;

    this.refreshStreetCap();
    const maxBet = this.streetCap;
    return alive.every(
      (p) => p.isAllIn || p.currentBet === maxBet
    );
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
    this.streetCap = 0;

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
    this.refreshStreetCap();
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
    for (const p of contenders) {
      try {
        const h = HandEvaluator.evaluate(p.cards);
        if (!best || h.value > best.value) {
          best = h;
        }
      } catch {
        /* skip incomplete */
      }
    }
    this.lastShowdownBest = best;
    this.phase = "complete";
  }

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
