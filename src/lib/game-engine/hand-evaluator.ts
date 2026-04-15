import type { Card, Rank, Suit } from "@/types/game";
import type { HandRank, HandResult } from "./types";

const RANK_VALUES: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14,
};

function rankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

function countRanks(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  return counts;
}

function isFlush(cards: Card[]): boolean {
  const suit = cards[0]?.suit as Suit;
  return cards.every((c) => c.suit === suit);
}

function isStraight(cards: Card[]): boolean {
  const values = [...new Set(cards.map((c) => rankValue(c.rank)))].sort((a, b) => a - b);
  if (values.length < 5) return false;
  // Ace-low straight: A-2-3-4-5
  const isAceLow =
    values[values.length - 1] === 14 &&
    values[0] === 2 &&
    values[1] === 3 &&
    values[2] === 4 &&
    values[3] === 5;
  if (isAceLow) return true;
  return values[values.length - 1]! - values[0]! === values.length - 1;
}

export function evaluateBestHand(cards: Card[]): { rank: HandRank; score: number; name: string } {
  const faceUp = cards.filter((c) => c.faceUp);
  const rankCounts = countRanks(faceUp);
  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const flush = faceUp.length >= 5 && isFlush(faceUp);
  const straight = faceUp.length >= 5 && isStraight(faceUp);
  const maxValue = Math.max(...faceUp.map((c) => rankValue(c.rank)));

  if (flush && straight && maxValue === 14) return { rank: "royal-flush", score: 900 + maxValue, name: "Royal Flush" };
  if (flush && straight) return { rank: "straight-flush", score: 800 + maxValue, name: "Straight Flush" };
  if (counts[0] === 4) return { rank: "four-of-a-kind", score: 700 + maxValue, name: "Four of a Kind" };
  if (counts[0] === 3 && counts[1] === 2) return { rank: "full-house", score: 600 + maxValue, name: "Full House" };
  if (flush) return { rank: "flush", score: 500 + maxValue, name: "Flush" };
  if (straight) return { rank: "straight", score: 400 + maxValue, name: "Straight" };
  if (counts[0] === 3) return { rank: "three-of-a-kind", score: 300 + maxValue, name: "Three of a Kind" };
  if (counts[0] === 2 && counts[1] === 2) return { rank: "two-pair", score: 200 + maxValue, name: "Two Pair" };
  if (counts[0] === 2) return { rank: "one-pair", score: 100 + maxValue, name: "One Pair" };
  return { rank: "high-card", score: maxValue, name: "High Card" };
}

export function determineWinners(results: HandResult[]): HandResult[] {
  const maxScore = Math.max(...results.map((r) => r.score));
  return results.filter((r) => r.score === maxScore);
}
