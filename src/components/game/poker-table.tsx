"use client";

import { useEffect } from "react";
import { useGame } from "@/hooks/use-game";
import { useAuthStore } from "@/store/auth-store";
import { PlayerSeat } from "./player-seat";
import { BettingControls } from "./betting-controls";
import { GameInfo } from "./game-info";
import { Skeleton } from "@/components/ui/skeleton";

interface PokerTableProps {
  gameId: string;
}

export function PokerTable({ gameId }: PokerTableProps) {
  const { user } = useAuthStore();
  const { gameState, players, myPlayer, isMyTurn, isConnected, sendAction, joinRoom, leaveRoom } =
    useGame(gameId, undefined);

  useEffect(() => {
    joinRoom();
    return () => leaveRoom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (!isConnected || !gameState) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-4">
        <Skeleton className="h-64 w-full rounded-full" />
        <Skeleton className="h-16 w-80" />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 px-4">
      <div className="relative flex w-full items-center justify-center rounded-full border-4 border-green-800 bg-green-900 py-16 shadow-2xl">
        <GameInfo />
        <div className="absolute inset-0 flex items-center justify-around">
          {players.map((player) => (
            <PlayerSeat
              key={player.id}
              player={player}
              isCurrentTurn={gameState.currentPlayerId === player.id}
              isMe={player.id === user?.id}
            />
          ))}
        </div>
      </div>
      {myPlayer && (
        <BettingControls
          isMyTurn={isMyTurn}
          canCheck={gameState.pot === 0}
          callAmount={myPlayer.bet}
          minRaise={20}
          maxRaise={myPlayer.chips}
          onAction={sendAction}
          className="w-full max-w-md"
        />
      )}
    </div>
  );
}
