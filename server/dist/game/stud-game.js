import { Deck } from "./deck.js";
import { HandEvaluator } from "./hand-evaluator.js";
const RANK_VALUE = {
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
const SUIT_ORDER = {
    clubs: 0,
    diamonds: 1,
    hearts: 2,
    spades: 3,
};
export class StudGame {
    config;
    deck;
    players = [];
    pot = 0;
    /** Amount to match on this betting street (max of players’ street bets). */
    currentBet = 0;
    currentRound = "third-street";
    phase = "waiting";
    currentPlayerIndex = 0;
    dealerPosition = 0;
    lastShowdownBest = null;
    lastShowdownWinnerId = null;
    constructor(config) {
        this.config = config;
        this.deck = new Deck();
    }
    // ─── getters ─────────────────────────────────────────────────────────────
    getPhase() {
        return this.phase;
    }
    getPlayers() {
        return this.players;
    }
    getPot() {
        return this.pot;
    }
    /** Table stake to call on the current street. */
    getTableStake() {
        return this.currentBet;
    }
    /** @deprecated alias — use `getTableStake()` */
    getStreetCap() {
        return this.currentBet;
    }
    getCurrentRound() {
        return this.currentRound;
    }
    getCurrentPlayerIndex() {
        return this.currentPlayerIndex;
    }
    getDealerPosition() {
        return this.dealerPosition;
    }
    getLastShowdownBest() {
        return this.lastShowdownBest;
    }
    getLastShowdownWinnerId() {
        return this.lastShowdownWinnerId;
    }
    /** Rank value 2–14 for a single card (door / kicker logic). */
    getCardValue(card) {
        return RANK_VALUE[card.rank];
    }
    // ─── seating ─────────────────────────────────────────────────────────────
    addPlayer(id, name, chips, position) {
        if (this.players.length >= this.config.maxPlayers) {
            throw new Error("Game is full");
        }
        if (this.players.some((p) => p.id === id)) {
            throw new Error("Player already seated");
        }
        const player = {
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
    removePlayer(id) {
        this.players = this.players.filter((p) => p.id !== id);
    }
    setDealerPosition(index) {
        if (index >= 0 && index < this.players.length) {
            this.dealerPosition = index;
        }
    }
    // ─── hand lifecycle ───────────────────────────────────────────────────────
    startHand() {
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
    collectAntes() {
        for (const player of this.players) {
            const ante = this.config.ante;
            if (player.chips >= ante) {
                player.chips -= ante;
                this.pot += ante;
                player.totalBet += ante;
            }
            else {
                this.pot += player.chips;
                player.totalBet += player.chips;
                player.chips = 0;
                player.isAllIn = true;
            }
        }
    }
    /** Everyone still in the pot receives third-street cards (incl. all-in who still play). */
    dealThirdStreet() {
        for (const player of this.players) {
            if (player.isFolded)
                continue;
            player.cards.push(...this.deck.deal(2, false));
            player.cards.push(...this.deck.deal(1, true));
        }
    }
    playersInHand() {
        return [...this.players]
            .filter((p) => !p.isFolded)
            .sort((a, b) => a.position - b.position);
    }
    getDoorCard(player) {
        const door = player.cards[2];
        if (!door)
            throw new Error("Missing door card");
        return door;
    }
    compareDoorCards(a, b) {
        const r1 = RANK_VALUE[a.rank];
        const s1 = SUIT_ORDER[a.suit];
        const r2 = RANK_VALUE[b.rank];
        const s2 = SUIT_ORDER[b.suit];
        if (r1 !== r2)
            return r1 - r2;
        return s1 - s2;
    }
    determineBringIn() {
        const eligible = this.playersInHand().filter((p) => p.cards.length >= 3);
        if (eligible.length === 0) {
            throw new Error("No eligible players for bring-in");
        }
        let lowestPlayer = eligible[0];
        let lowestCard = this.getDoorCard(lowestPlayer);
        for (const player of eligible) {
            if (player.isFolded || player.isAllIn)
                continue;
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
        if (lowestPlayer.chips === 0)
            lowestPlayer.isAllIn = true;
    }
    refreshTableStake() {
        const alive = this.playersInHand();
        if (alive.length === 0) {
            this.currentBet = 0;
            return;
        }
        this.currentBet = Math.max(...alive.map((p) => p.currentBet));
    }
    /** Third & fourth use small bet; fifth+ use big bet (standard stud structure). */
    betIncrement() {
        if (this.currentRound === "fifth-street" ||
            this.currentRound === "sixth-street" ||
            this.currentRound === "seventh-street") {
            return this.config.bigBet;
        }
        return this.config.smallBet;
    }
    // ─── player actions ──────────────────────────────────────────────────────
    playerAction(playerId, type, amount = 0) {
        const player = this.players.find((p) => p.id === playerId);
        if (!player || player.isFolded)
            return;
        if (this.phase !== "betting")
            return;
        const active = this.players[this.currentPlayerIndex];
        if (!active || active.id !== playerId)
            return;
        const stake = this.currentBet;
        switch (type) {
            case "fold":
                player.isFolded = true;
                player.isActive = false;
                break;
            case "check": {
                if (player.currentBet < stake)
                    return;
                break;
            }
            case "call": {
                const toCall = stake - player.currentBet;
                const pay = Math.min(toCall, player.chips);
                player.chips -= pay;
                player.currentBet += pay;
                player.totalBet += pay;
                this.pot += pay;
                if (player.chips === 0)
                    player.isAllIn = true;
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
                if (player.chips === 0)
                    player.isAllIn = true;
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
    bettingComplete() {
        const alive = this.playersInHand();
        if (alive.length <= 1)
            return true;
        this.refreshTableStake();
        const cap = this.currentBet;
        return alive.every((p) => p.isAllIn || p.currentBet === cap);
    }
    nextActivePlayer() {
        const n = this.players.length;
        for (let i = 1; i <= n; i++) {
            const idx = (this.currentPlayerIndex + i) % n;
            const p = this.players[idx];
            if (!p.isFolded && !p.isAllIn) {
                this.currentPlayerIndex = idx;
                return;
            }
        }
    }
    endBettingRound() {
        for (const p of this.players) {
            p.currentBet = 0;
        }
        this.currentBet = 0;
        const order = [
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
        this.currentRound = order[i + 1];
        if (this.currentRound === "seventh-street") {
            this.dealStreet(false);
        }
        else {
            this.dealStreet(true);
        }
        this.phase = "betting";
        this.currentPlayerIndex = this.firstPlayerToAct();
        this.refreshTableStake();
    }
    firstPlayerToAct() {
        const idx = this.players.findIndex((p) => !p.isFolded && !p.isAllIn);
        return idx >= 0 ? idx : 0;
    }
    dealStreet(faceUp) {
        for (const p of this.playersInHand()) {
            const c = this.deck.dealOne(faceUp);
            if (c)
                p.cards.push(c);
        }
    }
    runShowdown() {
        const contenders = this.playersInHand().filter((p) => p.cards.length >= 5);
        let best = null;
        let winnerId = null;
        for (const p of contenders) {
            try {
                const h = HandEvaluator.evaluate(p.cards);
                if (!best || h.value > best.value) {
                    best = h;
                    winnerId = p.id;
                }
            }
            catch {
                /* incomplete */
            }
        }
        this.lastShowdownBest = best;
        this.lastShowdownWinnerId = winnerId;
        this.phase = "complete";
        this.rotateDealerAfterHand();
    }
    /** Advance dealer button for the next hand. */
    rotateDealerAfterHand() {
        if (this.players.length === 0)
            return;
        this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
    }
    /** Manual street advance (testing / simple orchestration). */
    advanceStreet() {
        const order = [
            "third-street",
            "fourth-street",
            "fifth-street",
            "sixth-street",
            "seventh-street",
        ];
        const i = order.indexOf(this.currentRound);
        if (i >= 0 && i < order.length - 1) {
            this.currentRound = order[i + 1];
            this.phase = "betting";
        }
        else {
            this.phase = "showdown";
        }
    }
}
//# sourceMappingURL=stud-game.js.map