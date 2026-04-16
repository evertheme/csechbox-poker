"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { socketClient } from "@/lib/socket";
import { useGameStore } from "@/store/game-store";
import type { GameState } from "@/types/game";
import type { PlayerAction } from "@/types/game";
import { cn, formatChips } from "@/lib/utils";

export interface ActionPanelProps {
  tableId: string;
  gameState: GameState | null;
  currentUserId: string;
}

export function ActionPanel({ tableId, gameState, currentUserId }: ActionPanelProps) {
  const { socket } = useSocket();
  const players = useGameStore((s) => s.players);
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
    !!gameState &&
    gameState.phase === "betting" &&
    gameState.currentPlayerId === currentUserId;

  const currentActor = gameState?.currentPlayerId
    ? players.find((p) => p.id === gameState.currentPlayerId)
    : undefined;

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
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) return;
    s.emit("player-action", { tableId, type: action, amount });
  };

  if (!gameState || gameState.phase !== "betting") {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="p-6 text-center text-muted-foreground">
          Waiting for game to start...
        </CardContent>
      </Card>
    );
  }

  if (!currentPlayer) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="p-6 text-center text-muted-foreground">
          Take a seat to use action controls.
        </CardContent>
      </Card>
    );
  }

  if (!isMyTurn) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardContent className="space-y-2 p-6 text-center">
          <p className="text-muted-foreground">Waiting for your turn...</p>
          {currentActor && (
            <p className="mt-2 text-sm text-zinc-500">
              Current player:{" "}
              <span className="font-medium text-zinc-300">{currentActor.username}</span>
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
            <p className="text-sm text-zinc-500">Your bet (this round)</p>
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
          <Button variant="destructive" className="w-full" onClick={() => handleAction("fold")}>
            Fold
          </Button>

          {canCheck ? (
            <Button variant="secondary" className="w-full" onClick={() => handleAction("check")}>
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
            onClick={() => handleAction("raise", raiseAmount > 0 ? raiseAmount : minRaise)}
          >
            {raiseAmount > 0
              ? `Raise ${formatChips(raiseAmount)}`
              : `Raise ${formatChips(minRaise)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
