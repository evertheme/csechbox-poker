"use client";

import { useGame } from "@/hooks/use-game";
import { BettingControls } from "./betting-controls";

interface ActionPanelProps {
  roomId: string;
}

export function ActionPanel({ roomId }: ActionPanelProps) {
  const { gameState, myPlayer, isMyTurn, sendAction } = useGame(roomId);

  if (!gameState || !myPlayer) {
    return (
      <p className="text-center text-sm text-zinc-500">
        Take a seat to see betting controls.
      </p>
    );
  }

  return (
    <BettingControls
      isMyTurn={isMyTurn}
      canCheck={gameState.pot === 0}
      callAmount={myPlayer.currentBet}
      minRaise={20}
      maxRaise={myPlayer.chips}
      onAction={sendAction}
      className="w-full"
    />
  );
}
