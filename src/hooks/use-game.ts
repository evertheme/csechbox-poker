"use client";

import { useGameStore } from "@/store/game-store";
import { useSocket } from "./use-socket";
import type { PlayerAction } from "@/types/game";

export function useGame(gameId: string) {
  const socket = useSocket();
  const { gameState, players, myPlayerId, isConnected, lastError } = useGameStore();

  const myPlayer = players.find((p) => p.id === myPlayerId) ?? null;
  const isMyTurn = gameState?.currentPlayerId === myPlayerId;

  function sendAction(action: PlayerAction, amount?: number) {
    socket.emit("game:action", action, amount);
  }

  function joinRoom() {
    socket.emit("room:join", gameId);
  }

  function leaveRoom() {
    socket.emit("room:leave", gameId);
  }

  return { gameState, players, myPlayer, isMyTurn, isConnected, lastError, sendAction, joinRoom, leaveRoom };
}
