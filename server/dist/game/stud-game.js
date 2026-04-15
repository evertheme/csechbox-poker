import { Deck } from "./deck.js";
/**
 * 7-card stud table state (skeleton — extend with seats, pots, and streets).
 */
export class StudGame {
    config;
    phase = "waiting";
    street = "third-street";
    deck;
    constructor(config) {
        this.config = config;
        this.deck = new Deck();
        this.deck.shuffle();
    }
    /** Advance to the next betting round (stub). */
    advanceStreet() {
        const order = [
            "third-street",
            "fourth-street",
            "fifth-street",
            "sixth-street",
            "seventh-street",
        ];
        const i = order.indexOf(this.street);
        if (i >= 0 && i < order.length - 1) {
            this.street = order[i + 1];
            this.phase = "betting";
        }
        else {
            this.phase = "showdown";
        }
    }
}
//# sourceMappingURL=stud-game.js.map