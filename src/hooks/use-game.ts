"use client";

import { useGameStore } from "@/store/game-store";
import { useSocket } from "./use-socket";
import type { PlayerAction } from "@/types/game";

export function useGame(gameId: string) {
  const { socket } = useSocket();
  const {
    gameState,
    players,
    isConnected,
    lastError,
    selectedAction,
    raiseAmount,
    setSelectedAction,
    setRaiseAmount,
    getMyPlayer,
    getIsMyTurn,
  } = useGameStore();

  function sendAction(action: PlayerAction, amount?: number) {
    socket?.emit("game:action", {
      type: action,
      playerId: getMyPlayer()?.id ?? "",
      amount,
      timestamp: new Date(),
    });
  }

  function joinRoom() {
    socket?.emit("room:join", gameId, () => {});
  }

  function leaveRoom() {
    socket?.emit("room:leave", gameId);
  }

  return {
    gameState,
    players,
    myPlayer: getMyPlayer(),
    isMyTurn: getIsMyTurn(),
    isConnected,
    lastError,
    selectedAction,
    raiseAmount,
    setSelectedAction,
    setRaiseAmount,
    sendAction,
    joinRoom,
    leaveRoom,
  };
}
