"use client";

import { useGameStore } from "@/store/game-store";
import { ChipStack } from "./chip-stack";

const PHASE_LABELS: Record<string, string> = {
  waiting: "Waiting for players",
  ante: "Antes",
  "third-street": "3rd Street",
  "fourth-street": "4th Street",
  "fifth-street": "5th Street",
  "sixth-street": "6th Street",
  "seventh-street": "7th Street",
  showdown: "Showdown",
  ended: "Hand Complete",
};

export function GameInfo() {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {PHASE_LABELS[gameState.phase] ?? gameState.phase}
      </span>
      <ChipStack amount={gameState.pot} label="Pot" />
    </div>
  );
}
