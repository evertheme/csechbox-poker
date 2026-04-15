"use client";

import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  className?: string;
}

export function PlayerList({ className }: PlayerListProps) {
  const players = useGameStore((s) => s.players);
  const currentPlayerId = useGameStore((s) => s.gameState?.currentPlayerId);

  if (players.length === 0) {
    return (
      <p className={cn("text-sm text-zinc-500", className)}>No players at the table yet.</p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Players</p>
      <ul className="space-y-2">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <span className="truncate">{p.username}</span>
            <span
              className={cn(
                "shrink-0 tabular-nums",
                currentPlayerId === p.id && "font-semibold text-emerald-400"
              )}
            >
              {p.chips.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
