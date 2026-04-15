"use client";

import type { Player } from "@/types/player";
import { cn, formatChips } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlayingCard } from "./playing-card";

function initials(username: string): string {
  const t = username.trim();
  if (t.length === 0) return "?";
  if (t.length === 1) return t.toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

export interface PlayerSeatProps {
  player?: Player;
  /** 0-based seat index at the table (0–7). */
  position: number;
  isCurrentPlayer: boolean;
  isMe: boolean;
}

export function PlayerSeat({ player, position, isCurrentPlayer, isMe }: PlayerSeatProps) {
  if (!player) {
    return (
      <div className="flex h-40 w-32 items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/20">
          <p className="text-xs text-white/40">Empty</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative transition-transform",
        isMe && "z-10 scale-105 sm:scale-110"
      )}
    >
      {isCurrentPlayer && (
        <div
          className="pointer-events-none absolute inset-0 -m-2 animate-pulse rounded-2xl border-4 border-yellow-400"
          aria-hidden
        />
      )}

      <Card
        className={cn(
          "w-32 space-y-2 border-zinc-700 bg-zinc-900/95 p-3 text-card-foreground shadow-lg",
          player.isFolded && "opacity-50 grayscale",
          isMe && "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950"
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={player.avatarUrl} alt="" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {initials(player.username)}
            </AvatarFallback>
          </Avatar>

          <div className="w-full text-center">
            <p className="max-w-full truncate text-sm font-semibold text-white">
              {player.username}
              {isMe && (
                <span className="ml-1 text-[10px] font-normal text-blue-300">(you)</span>
              )}
            </p>
            <p className="text-xs text-zinc-400">{formatChips(player.chips)}</p>
            <p className="text-[10px] text-zinc-600">Seat {position + 1}</p>
          </div>
        </div>

        {player.cards.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {player.cards.map((card, index) => (
              <PlayingCard key={`${card.suit}-${card.rank}-${index}`} card={card} size="sm" />
            ))}
          </div>
        )}

        {player.currentBet > 0 && (
          <div className="text-center">
            <Badge variant="secondary" className="text-[10px]">
              Bet: {formatChips(player.currentBet)}
            </Badge>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-1">
          {player.isFolded && (
            <Badge variant="destructive" className="text-[10px]">
              Folded
            </Badge>
          )}
          {player.isAllIn && (
            <Badge className="bg-red-600 text-[10px] text-white hover:bg-red-600">
              All-in
            </Badge>
          )}
          {!player.isConnected && (
            <Badge variant="outline" className="border-amber-700 text-[10px] text-amber-200">
              Away
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
}
