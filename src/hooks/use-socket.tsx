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
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useGameStore } from "@/store/game-store";
import { toRoomInfo, useLobbyStore } from "@/store/lobby-store";
import type { PokerSocket } from "@/lib/socket";

interface SocketContextValue {
  socket: PokerSocket | null;
  isConnected: boolean;
  connect: (options?: { userId: string; accessToken?: string }) => void;
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
  const [socket, setSocket] = useState<PokerSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const { setGameState, addPlayer, removePlayer, applyAction, setError } = useGameStore();
  const { setRooms, addRoom, updateRoom, removeRoom } = useLobbyStore();

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    socketRef.current = null;
    setSocket(null);
    setIsConnected(false);
  }, []);

  const connect = useCallback((options?: { userId: string; accessToken?: string }) => {
    const s = socketClient.connect(options);
    socketRef.current = s;
    setSocket(s);
    if (s.connected) setIsConnected(true);
  }, []);

  /**
   * Single effect: session + connect must complete before we attach listeners.
   * Previously a second effect called getOrCreate() before getSession() finished, which
   * created a no-auth socket that never called .connect() and left listeners on the wrong instance.
   */
  useEffect(() => {
    if (!user) {
      disconnect();
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      const s = socketClient.connect({
        userId: user.id,
        accessToken: data.session?.access_token,
      });
      if (cancelled) {
        s.disconnect();
        return;
      }

      socketRef.current = s;
      setSocket(s);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);
      const onConnectError = () => setIsConnected(false);

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.on("connect_error", onConnectError);
      s.on("game:state", setGameState);
      s.on("game:start", setGameState);
      s.on("game:player-joined", addPlayer);
      s.on("game:player-left", removePlayer);
      s.on("game:action", (action) =>
        applyAction(action.playerId, action.type, action.amount)
      );
      s.on("game:error", (err) => setError(err.message));
      s.on("room:list", (rooms) => setRooms(rooms.map(toRoomInfo)));
      s.on("room:created", (room) => addRoom(toRoomInfo(room)));
      s.on("room:updated", (room) => updateRoom(room.id, toRoomInfo(room)));
      s.on("room:deleted", removeRoom);

      if (s.connected) setIsConnected(true);
    })();

    return () => {
      cancelled = true;
      socketClient.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [
    user,
    disconnect,
    setGameState,
    addPlayer,
    removePlayer,
    applyAction,
    setError,
    setRooms,
    addRoom,
    updateRoom,
    removeRoom,
  ]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
