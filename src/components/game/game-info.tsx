"use client";

import { useGameStore } from "@/store/game-store";
import { ChipStack } from "./chip-stack";
import type { GamePhase, BettingRound } from "@/types/game";

const PHASE_LABELS: Record<GamePhase, string> = {
  waiting: "Waiting for players",
  ante: "Antes",
  dealing: "Dealing",
  betting: "Betting",
  showdown: "Showdown",
  complete: "Hand Complete",
};

const ROUND_LABELS: Record<BettingRound, string> = {
  "third-street": "3rd Street",
  "fourth-street": "4th Street",
  "fifth-street": "5th Street",
  "sixth-street": "6th Street",
  "seventh-street": "7th Street",
};

interface GameInfoProps {
  /** Tighter layout for mobile footer strip. */
  compact?: boolean;
}

export function GameInfo({ compact = false }: GameInfoProps) {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const label =
    gameState.phase === "betting" && gameState.currentRound
      ? ROUND_LABELS[gameState.currentRound]
      : PHASE_LABELS[gameState.phase];

  return (
    <div
      className={
        compact
          ? "flex flex-row items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
          : "flex flex-col items-center gap-2"
      }
    >
      <span
        className={
          compact
            ? "text-xs font-semibold uppercase tracking-wide text-zinc-400"
            : "text-xs font-semibold uppercase tracking-widest text-zinc-500"
        }
      >
        {label}
      </span>
      <ChipStack amount={gameState.pot} label="Pot" />
    </div>
  );
}
