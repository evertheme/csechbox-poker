"use client";

import { cn } from "@/lib/utils";
import { formatChips } from "@/lib/utils";
import { PlayingCard } from "./playing-card";
import type { Player } from "@/types/player";

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  isMe: boolean;
}

export function PlayerSeat({ player, isCurrentTurn, isMe }: PlayerSeatProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl p-3 transition-all",
        isCurrentTurn && "ring-2 ring-yellow-400",
        player.isFolded && "opacity-40",
        isMe && "bg-zinc-800/50"
      )}
    >
      <div className="flex gap-1">
        {player.cards.map((card, i) => (
          <PlayingCard key={i} card={card} size="sm" />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <span className={cn("text-xs font-semibold", isMe ? "text-white" : "text-zinc-300")}>
          {player.username}
          {isMe && " (you)"}
        </span>
        <span className="text-xs text-yellow-400">{formatChips(player.chips)}</span>
        {player.currentBet > 0 && (
          <span className="text-xs text-zinc-500">Bet: {formatChips(player.currentBet)}</span>
        )}
      </div>
      {player.isFolded && <span className="text-xs text-red-400 font-semibold">FOLDED</span>}
      {player.isAllIn && <span className="text-xs text-orange-400 font-semibold">ALL IN</span>}
    </div>
  );
}
