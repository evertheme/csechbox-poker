"use client";

import { useEffect, type CSSProperties } from "react";
import { useGame } from "@/hooks/use-game";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { PlayerSeat } from "./player-seat";
import { BettingControls } from "./betting-controls";
import { GameInfo } from "./game-info";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_SEATS = 8;

/** Absolute positions (percent of table) for seats around an 8-max racetrack. */
const SEAT_POSITIONS: CSSProperties[] = [
  { top: "5%", left: "50%", transform: "translate(-50%, 0)" },
  { top: "12%", left: "78%", transform: "translate(-50%, 0)" },
  { top: "38%", left: "90%", transform: "translate(-50%, -50%)" },
  { top: "68%", left: "78%", transform: "translate(-50%, -50%)" },
  { top: "82%", left: "50%", transform: "translate(-50%, -100%)" },
  { top: "68%", left: "22%", transform: "translate(-50%, -50%)" },
  { top: "38%", left: "10%", transform: "translate(-50%, -50%)" },
  { top: "12%", left: "22%", transform: "translate(-50%, 0)" },
];

interface PokerTableProps {
  gameId: string;
  /** When false, render betting UI elsewhere (e.g. `ActionPanel`). Default: true. */
  showBettingControls?: boolean;
}

export function PokerTable({ gameId, showBettingControls = true }: PokerTableProps) {
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? "";
  const { gameState, players, myPlayer, isMyTurn, isConnected, sendAction, joinRoom, leaveRoom } =
    useGame(gameId);

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
            "border-8 border-amber-900 bg-gradient-to-br from-green-800 to-green-950",
            "shadow-2xl shadow-black/50"
          )}
        >
          <p className="text-center text-lg text-white md:text-xl">Waiting for game to start…</p>
        </div>
      </div>
    );
  }

  const seated = [...players].sort((a, b) => a.position - b.position).slice(0, MAX_SEATS);

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
        {/* Felt highlight */}
        <div
          className="pointer-events-none absolute inset-[6%] rounded-[2.25rem] border border-white/5 bg-gradient-to-b from-white/5 to-transparent"
          aria-hidden
        />

        {/* Center: phase + pot */}
        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
          <GameInfo />
        </div>

        {/* Seats */}
        {seated.map((player, index) => {
          const style = SEAT_POSITIONS[index % SEAT_POSITIONS.length];
          return (
            <div
              key={player.id}
              className="absolute z-20 w-[min(28%,140px)] min-w-[96px] max-w-[160px]"
              style={style}
            >
              <PlayerSeat
                player={player}
                isCurrentTurn={gameState.currentPlayerId === player.id}
                isMe={player.id === currentUserId}
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
