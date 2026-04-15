"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import type { GameState } from "@/types/game";
import { useGame } from "@/hooks/use-game";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { PlayerSeat } from "./player-seat";
import { BettingControls } from "./betting-controls";
import { GameInfo } from "./game-info";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_SEATS = 8;

/** Eight seats around the racetrack (clockwise from top). */
const SEAT_POSITIONS: CSSProperties[] = [
  { top: "10%", left: "50%", transform: "translate(-50%, 0)" }, // Top
  { top: "20%", left: "75%", transform: "translate(-50%, 0)" }, // Top-right
  { top: "50%", left: "88%", transform: "translate(-50%, -50%)" }, // Right
  { top: "80%", left: "75%", transform: "translate(-50%, -100%)" }, // Bottom-right
  { top: "90%", left: "50%", transform: "translate(-50%, -100%)" }, // Bottom
  { top: "80%", left: "25%", transform: "translate(-50%, -100%)" }, // Bottom-left
  { top: "50%", left: "12%", transform: "translate(-50%, -50%)" }, // Left
  { top: "20%", left: "25%", transform: "translate(-50%, 0)" }, // Top-left
];

export interface PokerTableProps {
  gameId: string;
  gameState: GameState | null;
  currentUserId: string;
  /** When false, render betting UI elsewhere (e.g. `ActionPanel`). Default: true. */
  showBettingControls?: boolean;
}

export function PokerTable({
  gameId,
  gameState,
  currentUserId,
  showBettingControls = true,
}: PokerTableProps) {
  const players = useGameStore((s) => s.players);
  const { myPlayer, isMyTurn, isConnected, sendAction, joinRoom, leaveRoom } = useGame(gameId);

  useEffect(() => {
    joinRoom();
    return () => leaveRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (!isConnected) {
    return (
      <div className="flex w-full max-w-4xl flex-col items-center gap-4 px-4">
        <Skeleton className="aspect-[16/10] w-full rounded-[3rem]" />
        <Skeleton className="h-16 w-80 max-w-full" />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="w-full max-w-4xl px-4">
        <div
          className={cn(
            "relative flex aspect-[16/10] items-center justify-center rounded-[3rem]",
            "border-8 border-amber-900 bg-gradient-to-br from-green-800 to-green-900",
            "shadow-2xl shadow-black/50"
          )}
        >
          <p className="text-center text-xl text-white">Waiting for game to start...</p>
        </div>
      </div>
    );
  }

  const seatOccupants = useMemo(() => {
    const slots: (typeof players[number] | undefined)[] = Array.from(
      { length: MAX_SEATS },
      () => undefined
    );
    for (const p of players) {
      const i = p.position;
      if (i >= 0 && i < MAX_SEATS && slots[i] === undefined) {
        slots[i] = p;
      }
    }
    return slots;
  }, [players]);

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6 px-4">
      <div
        className={cn(
          "relative w-full overflow-visible",
          "aspect-[16/10] rounded-[3rem]",
          "border-8 border-amber-900 bg-gradient-to-br from-green-800 via-green-900 to-green-950",
          "shadow-2xl shadow-black/50 ring-1 ring-amber-950/40"
        )}
      >
        <div
          className="pointer-events-none absolute inset-[6%] rounded-[2.25rem] border border-white/5 bg-gradient-to-b from-white/5 to-transparent"
          aria-hidden
        />

        <div className="absolute left-1/2 top-1/2 z-10 flex w-[min(90%,280px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
          <GameInfo compact />
        </div>

        {seatOccupants.map((player, seatIndex) => {
          const style = SEAT_POSITIONS[seatIndex];
          return (
            <div
              key={seatIndex}
              className="absolute z-20 w-[min(28%,140px)] min-w-[96px] max-w-[160px]"
              style={style}
            >
              <PlayerSeat
                player={player}
                position={seatIndex}
                isCurrentPlayer={
                  !!player && gameState.currentPlayerId === player.id
                }
                isMe={!!player && player.id === currentUserId}
              />
            </div>
          );
        })}
      </div>

      {showBettingControls && myPlayer && (
        <BettingControls
          isMyTurn={isMyTurn}
          canCheck={gameState.pot === 0}
          callAmount={myPlayer.currentBet}
          minRaise={20}
          maxRaise={myPlayer.chips}
          onAction={sendAction}
          className="w-full max-w-md"
        />
      )}
    </div>
  );
}
