"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";
import type { PokerSocket } from "@/lib/socket";

const SocketContext = createContext<PokerSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useRef(getSocket());
  const { user } = useAuthStore();
  const { setConnected, setGameState, addPlayer, removePlayer, applyAction, setError } =
    useGameStore();
  const { setRooms, addRoom, updateRoom, removeRoom } = useLobbyStore();

  // Connect/disconnect when auth state changes
  useEffect(() => {
    const s = socket.current;

    if (user && !s.connected) {
      s.connect();
    } else if (!user && s.connected) {
      disconnectSocket();
      socket.current = getSocket();
    }
  }, [user]);

  // Register all server→client event handlers once
  useEffect(() => {
    const s = socket.current;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("game:state", setGameState);
    s.on("game:player-joined", addPlayer);
    s.on("game:player-left", removePlayer);
    s.on("game:action", applyAction);
    s.on("game:error", (msg) => setError(msg));
    s.on("room:list", setRooms);
    s.on("room:created", addRoom);
    s.on("room:updated", updateRoom);
    s.on("room:deleted", removeRoom);

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("game:state");
      s.off("game:player-joined");
      s.off("game:player-left");
      s.off("game:action");
      s.off("game:error");
      s.off("room:list");
      s.off("room:created");
      s.off("room:updated");
      s.off("room:deleted");
      disconnectSocket();
    };
  }, [setConnected, setGameState, addPlayer, removePlayer, applyAction, setError, setRooms, addRoom, updateRoom, removeRoom]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): PokerSocket {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("useSocket must be used within a SocketProvider");
  return socket;
}
