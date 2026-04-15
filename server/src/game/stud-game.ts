import type { BettingRound, GameConfig, GamePhase } from "../types/index.js";
import { Deck } from "./deck.js";

/**
 * 7-card stud table state (skeleton — extend with seats, pots, and streets).
 */
export class StudGame {
  readonly config: GameConfig;
  phase: GamePhase = "waiting";
  street: BettingRound = "third-street";
  readonly deck: Deck;

  constructor(config: GameConfig) {
    this.config = config;
    this.deck = new Deck();
    this.deck.shuffle();
  }

  /** Advance to the next betting round (stub). */
  advanceStreet(): void {
    const order: BettingRound[] = [
      "third-street",
      "fourth-street",
      "fifth-street",
      "sixth-street",
      "seventh-street",
    ];
    const i = order.indexOf(this.street);
    if (i >= 0 && i < order.length - 1) {
      this.street = order[i + 1]!;
      this.phase = "betting";
    } else {
      this.phase = "showdown";
    }
  }
}
