"use client";

import { cn } from "@/lib/utils";
import type { Card as CardType } from "@/types/game";

interface PlayingCardProps {
  card: CardType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const RED_SUITS = new Set(["hearts", "diamonds"]);

const SIZE_CLASSES = {
  sm: "w-8 h-12 text-xs",
  md: "w-12 h-18 text-sm",
  lg: "w-16 h-24 text-base",
};

export function PlayingCard({ card, size = "md", className }: PlayingCardProps) {
  if (!card.faceUp) {
    return (
      <div
        className={cn(
          "rounded-md border-2 border-zinc-600 bg-zinc-800 flex items-center justify-center",
          SIZE_CLASSES[size],
          className
        )}
      >
        <span className="text-zinc-600 text-lg">🂠</span>
      </div>
    );
  }

  const isRed = RED_SUITS.has(card.suit);
  const suit = SUIT_SYMBOLS[card.suit] ?? "";

  return (
    <div
      className={cn(
        "rounded-md border-2 border-zinc-300 bg-white flex flex-col items-start justify-between p-1 font-bold select-none",
        SIZE_CLASSES[size],
        isRed ? "text-red-600" : "text-zinc-900",
        className
      )}
    >
      <span className="leading-none">{card.rank}</span>
      <span className="self-center text-lg leading-none">{suit}</span>
      <span className="leading-none self-end rotate-180">{card.rank}</span>
    </div>
  );
}
