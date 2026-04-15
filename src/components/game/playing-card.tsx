"use client";

import type { Card as CardType, Suit } from "@/types/game";
import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: CardType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<Suit, string> = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-neutral-900",
  spades: "text-neutral-900",
};

const sizes = {
  sm: "h-12 w-8 text-xs",
  md: "h-16 w-12 text-sm",
  lg: "h-24 w-16 text-base",
};

export function PlayingCard({ card, size = "md", className }: PlayingCardProps) {
  if (!card.faceUp) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded border-2 border-zinc-400 bg-gradient-to-br from-blue-600 to-blue-900 shadow-md",
          sizes[size],
          className
        )}
      >
        <div className="rotate-45 text-[10px] text-white sm:text-xs">★</div>
      </div>
    );
  }

  const color = suitColors[card.suit];
  const sym = suitSymbols[card.suit];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between rounded border-2 border-zinc-300 bg-white p-1 shadow-md",
        sizes[size],
        className
      )}
    >
      <div className={cn("flex flex-col items-center font-bold leading-none", color)}>
        <div>{card.rank}</div>
        <div className="text-center">{sym}</div>
      </div>

      <div className={cn("leading-none", color, size === "sm" ? "text-base" : "text-2xl")}>
        {sym}
      </div>

      <div className={cn("flex rotate-180 flex-col items-center font-bold leading-none", color)}>
        <div className="text-center">{sym}</div>
        <div>{card.rank}</div>
      </div>
    </div>
  );
}
