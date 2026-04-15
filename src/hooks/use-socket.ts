"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function useSocket(token?: string) {
  const socket = useRef(getSocket());
  const { setConnected, setGameState, setPlayers, addPlayer, removePlayer, applyAction, setError } =
    useGameStore();
  const { setRooms, addRoom, updateRoom, removeRoom } = useLobbyStore();

  useEffect(() => {
    const s = socket.current;

    if (token && !s.connected) {
      s.auth = { token };
      s.connect();
    }

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
    };
  }, [token, setConnected, setGameState, setPlayers, addPlayer, removePlayer, applyAction, setError, setRooms, addRoom, updateRoom, removeRoom]);

  return socket.current;
}
