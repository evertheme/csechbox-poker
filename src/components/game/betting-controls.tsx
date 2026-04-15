"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlayerAction } from "@/types/game";

interface BettingControlsProps {
  isMyTurn: boolean;
  canCheck: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  onAction: (action: PlayerAction, amount?: number) => void;
  className?: string;
}

export function BettingControls({
  isMyTurn,
  canCheck,
  callAmount,
  minRaise,
  maxRaise,
  onAction,
  className,
}: BettingControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  if (!isMyTurn) return null;

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4", className)}>
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={() => onAction("fold")} className="flex-1">
          Fold
        </Button>
        {canCheck ? (
          <Button variant="outline" size="sm" onClick={() => onAction("check")} className="flex-1">
            Check
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onAction("call", callAmount)} className="flex-1">
            Call {callAmount}
          </Button>
        )}
        <Button variant="poker" size="sm" onClick={() => onAction("raise", raiseAmount)} className="flex-1">
          Raise {raiseAmount}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 w-12">{minRaise}</span>
        <input
          type="range"
          min={minRaise}
          max={maxRaise}
          value={raiseAmount}
          onChange={(e) => setRaiseAmount(Number(e.target.value))}
          className="flex-1 accent-green-500"
        />
        <span className="text-xs text-zinc-500 w-12 text-right">{maxRaise}</span>
      </div>
    </div>
  );
}
