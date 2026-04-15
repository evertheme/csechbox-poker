import { create } from "zustand";
import type { GameState, GameAction, PlayerAction } from "@/types/game";
import type { Player } from "@/types/player";

interface GameStore {
  gameState: GameState | null;
  players: Player[];
  myPlayerId: string | null;
  isConnected: boolean;
  lastError: string | null;
  setGameState: (state: GameState) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setMyPlayerId: (id: string) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  applyAction: (playerId: string, action: PlayerAction, amount?: number) => void;
  reset: () => void;
}

const initialState = {
  gameState: null,
  players: [],
  myPlayerId: null,
  isConnected: false,
  lastError: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setGameState: (gameState) => set({ gameState }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((s) => ({ players: [...s.players, player] })),
  removePlayer: (playerId) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== playerId) })),
  setMyPlayerId: (myPlayerId) => set({ myPlayerId }),
  setConnected: (isConnected) => set({ isConnected }),
  setError: (lastError) => set({ lastError }),
  applyAction: (playerId, action, amount) =>
    set((s) => {
      if (!s.gameState) return s;
      const lastAction: GameAction = { type: action, playerId, amount, timestamp: new Date() };
      return { gameState: { ...s.gameState, lastAction } };
    }),
  reset: () => set(initialState),
}));
