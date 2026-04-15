"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { socketClient } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";
import type { PokerSocket } from "@/lib/socket";

interface SocketContextValue {
  socket: PokerSocket | null;
  isConnected: boolean;
  connect: (userId?: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<PokerSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const { setGameState, addPlayer, removePlayer, applyAction, setError } = useGameStore();
  const { setRooms, addRoom, updateRoom, removeRoom } = useLobbyStore();

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const connect = useCallback((userId?: string) => {
    const s = socketClient.connect(userId);
    socketRef.current = s;
  }, []);

  // Auto-connect/disconnect when auth state changes
  useEffect(() => {
    if (user) {
      connect(user.id);
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  // Register server→client event handlers
  useEffect(() => {
    const s = socketClient.getOrCreate();
    socketRef.current = s;

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));
    s.on("connect_error", () => setIsConnected(false));
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
      s.off("connect_error");
      s.off("game:state");
      s.off("game:player-joined");
      s.off("game:player-left");
      s.off("game:action");
      s.off("game:error");
      s.off("room:list");
      s.off("room:created");
      s.off("room:updated");
      s.off("room:deleted");
      socketClient.disconnect();
    };
  }, [setGameState, addPlayer, removePlayer, applyAction, setError, setRooms, addRoom, updateRoom, removeRoom]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isConnected, connect, disconnect }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx.socket && typeof window !== "undefined") {
    console.warn("useSocket: socket not yet connected");
  }
  return ctx;
}
