"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/types/player";
import { cn, formatChips } from "@/lib/utils";
import { useGameStore } from "@/store/game-store";

function initials(username: string): string {
  const t = username.trim();
  if (t.length === 0) return "?";
  if (t.length === 1) return t.toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

export interface PlayerListProps {
  players?: Player[];
  className?: string;
}

export function PlayerList({ players: playersProp, className }: PlayerListProps) {
  const playersFromStore = useGameStore((s) => s.players);
  const currentPlayerId = useGameStore((s) => s.gameState?.currentPlayerId);
  const players = playersProp ?? playersFromStore;

  if (!players || players.length === 0) {
    return (
      <Card className={cn("border-zinc-800 bg-zinc-900/90", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Players</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">No players yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-zinc-800 bg-zinc-900/90", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Players ({players.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 transition-colors",
              player.isFolded && "opacity-50",
              !player.isConnected ? "bg-zinc-800/80" : "hover:bg-zinc-800/50",
              currentPlayerId === player.id && "ring-1 ring-emerald-500/60"
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={player.avatarUrl} alt="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                {initials(player.username)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{player.username}</p>
              <p className="text-xs text-zinc-400">{formatChips(player.chips)}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              {player.currentBet > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {formatChips(player.currentBet)}
                </Badge>
              )}
              {player.isFolded && (
                <Badge variant="destructive" className="text-[10px]">
                  Fold
                </Badge>
              )}
              {player.isAllIn && (
                <Badge className="bg-red-600 text-[10px] text-white hover:bg-red-600">All-in</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
