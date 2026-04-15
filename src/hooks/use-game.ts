"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useGameStore } from "@/store/game-store";
import { useSocket } from "./use-socket";
import type { PlayerAction } from "@/types/game";

export function useGame(gameId: string) {
  const { socket } = useSocket();
  const user = useAuthStore((s) => s.user);
  const setMyPlayerId = useGameStore((s) => s.setMyPlayerId);
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

  useEffect(() => {
    if (user?.id) setMyPlayerId(user.id);
    return () => setMyPlayerId(null);
  }, [user?.id, setMyPlayerId]);

  function sendAction(action: PlayerAction, amount?: number) {
    socket?.emit("player-action", {
      roomId: gameId,
      type: action,
      amount,
    });
  }

  function joinRoom() {
    socket?.emit("join-room", gameId, () => {});
  }

  function leaveRoom() {
    socket?.emit("leave-room", gameId);
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
