const RANK_VAL = {
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
function combinations5(cards) {
    const out = [];
    const n = cards.length;
    for (let a = 0; a < n; a++)
        for (let b = a + 1; b < n; b++)
            for (let c = b + 1; c < n; c++)
                for (let d = c + 1; d < n; d++)
                    for (let e = d + 1; e < n; e++) {
                        const A = cards[a];
                        const B = cards[b];
                        const C = cards[c];
                        const D = cards[d];
                        const E = cards[e];
                        if (A && B && C && D && E)
                            out.push([A, B, C, D, E]);
                    }
    return out;
}
function isFlush(cards) {
    const s = cards[0]?.suit;
    return s !== undefined && cards.every((c) => c.suit === s);
}
function straightHigh(values) {
    const uniq = [...new Set(values)].sort((x, y) => x - y);
    if (uniq.length !== 5)
        return null;
    if (uniq[0] === 2 &&
        uniq[1] === 3 &&
        uniq[2] === 4 &&
        uniq[3] === 5 &&
        uniq[4] === 14) {
        return 5;
    }
    for (let i = 1; i < uniq.length; i++) {
        if (uniq[i] !== uniq[i - 1] + 1)
            return null;
    }
    return uniq[4];
}
function evaluateFive(cards) {
    const vals = cards.map((c) => RANK_VAL[c.rank]).sort((a, b) => b - a);
    const counts = new Map();
    for (const v of vals) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const flush = isFlush(cards);
    const sh = straightHigh(vals);
    if (flush && sh !== null) {
        return { cat: 1, kickers: [sh] };
    }
    const rankByCount = [...counts.entries()].sort((a, b) => {
        if (b[1] !== a[1])
            return b[1] - a[1];
        return b[0] - a[0];
    });
    const four = rankByCount.find(([, n]) => n === 4);
    if (four) {
        const kicker = vals.find((v) => v !== four[0]);
        return { cat: 2, kickers: [four[0], kicker] };
    }
    const three = rankByCount.find(([, n]) => n === 3);
    const two = rankByCount.find(([, n]) => n === 2);
    if (three && two) {
        return { cat: 3, kickers: [three[0], two[0]] };
    }
    if (flush) {
        return { cat: 4, kickers: vals };
    }
    if (sh !== null) {
        return { cat: 5, kickers: [sh] };
    }
    if (three) {
        const kickers = vals.filter((v) => v !== three[0]).sort((a, b) => b - a);
        return { cat: 6, kickers: [three[0], ...kickers] };
    }
    const pairRanks = [...counts.entries()]
        .filter(([, n]) => n === 2)
        .map(([r]) => r)
        .sort((a, b) => b - a);
    if (pairRanks.length >= 2) {
        const [p1, p2] = pairRanks;
        const kicker = vals.find((v) => v !== p1 && v !== p2);
        return { cat: 7, kickers: [p1, p2, kicker] };
    }
    if (pairRanks.length === 1) {
        const p = pairRanks[0];
        const ks = vals.filter((v) => v !== p).sort((a, b) => b - a);
        return { cat: 8, kickers: [p, ...ks] };
    }
    return { cat: 9, kickers: vals };
}
function better(a, b) {
    if (a.cat !== b.cat)
        return a.cat < b.cat;
    const len = Math.max(a.kickers.length, b.kickers.length);
    for (let i = 0; i < len; i++) {
        const x = a.kickers[i] ?? 0;
        const y = b.kickers[i] ?? 0;
        if (x !== y)
            return x > y;
    }
    return false;
}
const CAT_NAMES = {
    1: "Straight flush",
    2: "Four of a kind",
    3: "Full house",
    4: "Flush",
    5: "Straight",
    6: "Three of a kind",
    7: "Two pair",
    8: "One pair",
    9: "High card",
};
/** Best 5-card high hand from up to 7 cards (7-card stud showdown). */
export function evaluateSevenCardStud(cards) {
    if (cards.length < 5) {
        return {
            rank: 9,
            name: "Incomplete",
            cards: [...cards],
            description: "Need at least five cards",
        };
    }
    const combos = combinations5(cards);
    let best = evaluateFive(combos[0]);
    let bestCombo = combos[0];
    for (let i = 1; i < combos.length; i++) {
        const c = combos[i];
        const s = evaluateFive(c);
        if (better(s, best)) {
            best = s;
            bestCombo = c;
        }
    }
    return {
        rank: best.cat,
        name: CAT_NAMES[best.cat] ?? "Unknown",
        cards: bestCombo,
        description: `${CAT_NAMES[best.cat] ?? "Hand"} (${best.kickers.join(",")})`,
    };
}
