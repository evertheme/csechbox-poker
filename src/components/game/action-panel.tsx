"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/store/game-store";
import type { GameState } from "@/types/game";
import type { PlayerAction } from "@/types/game";
import { cn, formatChips } from "@/lib/utils";
import { useGame } from "@/hooks/use-game";

export interface ActionPanelProps {
  roomId: string;
  gameState: GameState | null;
  currentUserId: string;
}

export function ActionPanel({ roomId, gameState, currentUserId }: ActionPanelProps) {
  const players = useGameStore((s) => s.players);
  const { sendAction } = useGame(roomId);
  const [raiseAmount, setRaiseAmount] = useState(0);

  const currentPlayer = players.find((p) => p.id === currentUserId);

  const tableBet = gameState?.currentBet ?? 0;
  const myBet = currentPlayer?.currentBet ?? 0;
  const callAmount = Math.max(0, tableBet - myBet);
  const canCheck = callAmount === 0;
  const smallBet = gameState?.config.smallBet ?? 10;
  const minRaise = tableBet + smallBet;
  const maxRaise = currentPlayer?.chips ?? 0;

  const isMyTurn =
    !!gameState && gameState.currentPlayerId === currentUserId && gameState.phase === "betting";

  useEffect(() => {
    if (!gameState || !currentPlayer) return;
    const lo = Math.min(minRaise, maxRaise);
    const hi = Math.max(lo, maxRaise);
    setRaiseAmount((prev) => {
      const base = prev || lo;
      const next = Math.min(Math.max(base, lo), hi);
      return Number.isFinite(next) ? next : lo;
    });
  }, [
    gameState?.currentBet,
    gameState?.currentPlayerId,
    gameState?.id,
    minRaise,
    maxRaise,
    currentPlayer?.id,
  ]);

  const handleAction = (action: PlayerAction, amount?: number) => {
    sendAction(action, amount);
  };

  if (!gameState || gameState.phase !== "betting") {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="p-6 text-center text-zinc-400">
          {gameState?.phase === "waiting"
            ? "Waiting for the hand to start…"
            : "Betting is not open right now."}
        </CardContent>
      </Card>
    );
  }

  if (!currentPlayer) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="p-6 text-center text-zinc-400">
          Take a seat to get action controls.
        </CardContent>
      </Card>
    );
  }

  const actor = players.find((p) => p.id === gameState.currentPlayerId);

  if (!isMyTurn) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="space-y-2 p-6 text-center">
          <p className="text-zinc-400">Waiting for your turn…</p>
          {actor && (
            <p className="text-sm text-zinc-500">
              Current: <span className="font-medium text-zinc-300">{actor.username}</span>
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const showRaiseSlider = !canCheck && callAmount < currentPlayer.chips && maxRaise >= minRaise;

  return (
    <Card className="border-zinc-800 bg-zinc-900/90">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Your chips</p>
            <p className="text-2xl font-bold text-white">{formatChips(currentPlayer.chips)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">In this round</p>
            <p className="text-2xl font-bold text-white">{formatChips(myBet)}</p>
          </div>
        </div>

        {showRaiseSlider && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Raise to</span>
              <span className="font-semibold text-white">{formatChips(raiseAmount)}</span>
            </div>
            <Slider
              value={[raiseAmount]}
              onValueChange={(value) => setRaiseAmount(value[0] ?? minRaise)}
              min={minRaise}
              max={Math.max(minRaise, maxRaise)}
              step={smallBet}
              disabled={minRaise > maxRaise}
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Min {formatChips(minRaise)}</span>
              <span>Max {formatChips(maxRaise)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => handleAction("fold")}
          >
            Fold
          </Button>

          {canCheck ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleAction("check")}
            >
              Check
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              disabled={callAmount > currentPlayer.chips}
              onClick={() => handleAction("call", callAmount)}
            >
              Call {formatChips(callAmount)}
            </Button>
          )}

          <Button
            variant="poker"
            className={cn("w-full")}
            disabled={currentPlayer.chips < minRaise || minRaise > maxRaise}
            onClick={() =>
              handleAction("raise", raiseAmount > 0 ? raiseAmount : minRaise)
            }
          >
            {raiseAmount > 0 ? `Raise ${formatChips(raiseAmount)}` : `Raise ${formatChips(minRaise)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
