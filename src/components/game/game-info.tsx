"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameState, GamePhase, BettingRound } from "@/types/game";
import { formatChips } from "@/lib/utils";
import { Clock, Users, DollarSign } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

const PHASE_LABELS: Record<GamePhase, string> = {
  waiting: "Waiting",
  ante: "Collecting Antes",
  dealing: "Dealing Cards",
  betting: "Betting Round",
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

function roundLabel(round: BettingRound | null): string {
  if (!round) return "—";
  return ROUND_LABELS[round] ?? round.replace(/-/g, " ");
}

export interface GameInfoProps {
  /** When omitted, reads from `useGameStore` so `<GameInfo />` works without props. */
  gameState?: GameState | null;
  compact?: boolean;
}

export function GameInfo({ gameState: gameStateProp, compact = false }: GameInfoProps) {
  const gameStateFromStore = useGameStore((s) => s.gameState);
  const players = useGameStore((s) => s.players);
  const gameState = gameStateProp ?? gameStateFromStore;

  const activeCount = players.filter((p) => !p.isFolded).length;
  const totalCount = players.length;

  if (!gameState) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="p-6 text-center text-muted-foreground">No game data</CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-around gap-3 text-sm text-white",
          "rounded-lg border border-white/10 bg-black/20 px-3 py-2"
        )}
      >
        <div className="text-center">
          <p className="text-white/60">Pot</p>
          <p className="font-bold tabular-nums">{formatChips(gameState.pot)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60">Round</p>
          <p className="font-bold capitalize">
            {gameState.phase === "betting" && gameState.currentRound
              ? roundLabel(gameState.currentRound)
              : "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-white/60">Players</p>
          <p className="font-bold tabular-nums">
            {activeCount}/{totalCount}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/90">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Game info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Phase</span>
          <Badge variant="outline" className="border-zinc-600 text-zinc-200">
            {PHASE_LABELS[gameState.phase] ?? gameState.phase}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>Pot</span>
          </div>
          <span className="text-lg font-bold tabular-nums text-white">
            {formatChips(gameState.pot)}
          </span>
        </div>

        {gameState.currentRound && gameState.phase === "betting" && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Street</span>
            <span className="font-semibold capitalize text-white">
              {roundLabel(gameState.currentRound)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Current bet</span>
          <span className="font-semibold tabular-nums text-white">
            {formatChips(gameState.currentBet)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>Active</span>
          </div>
          <span className="font-semibold tabular-nums text-white">
            {activeCount} / {totalCount}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-800 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Turn limit</span>
          </div>
          <span className="font-semibold text-white">{gameState.config.timeLimit}s</span>
        </div>

        <div className="space-y-2 border-t border-zinc-800 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Stakes
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Ante</p>
              <p className="font-semibold text-white">{formatChips(gameState.config.ante)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bring-in</p>
              <p className="font-semibold text-white">{formatChips(gameState.config.bringIn)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Small bet</p>
              <p className="font-semibold text-white">{formatChips(gameState.config.smallBet)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Big bet</p>
              <p className="font-semibold text-white">{formatChips(gameState.config.bigBet)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
