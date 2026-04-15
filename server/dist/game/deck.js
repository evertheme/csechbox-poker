export class Deck {
    cards = [];
    constructor() {
        this.reset();
    }
    reset() {
        this.cards = [];
        const suits = ["hearts", "diamonds", "clubs", "spades"];
        const ranks = [
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K",
            "A",
        ];
        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push({ suit, rank, faceUp: false });
            }
        }
    }
    shuffle() {
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const a = this.cards[i];
            const b = this.cards[j];
            if (a === undefined || b === undefined)
                continue;
            this.cards[i] = b;
            this.cards[j] = a;
        }
    }
    deal(count = 1, faceUp = false) {
        const dealt = this.cards.splice(0, count);
        return dealt.map((card) => ({ ...card, faceUp }));
    }
    dealOne(faceUp = false) {
        const card = this.cards.shift();
        return card ? { ...card, faceUp } : null;
    }
    remaining() {
        return this.cards.length;
    }
    isEmpty() {
        return this.cards.length === 0;
    }
}
//# sourceMappingURL=deck.js.map