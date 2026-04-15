import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GameState, GameAction, PlayerAction } from "@/types/game";
import type { Player } from "@/types/player";

interface GameStore {
  // Server-synced state
  gameState: GameState | null;
  players: Player[];
  myPlayerId: string | null;
  isConnected: boolean;
  lastError: string | null;

  // UI state
  selectedAction: PlayerAction | null;
  raiseAmount: number;

  // Server-synced actions
  setGameState: (state: GameState) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setMyPlayerId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  applyAction: (playerId: string, action: PlayerAction, amount?: number) => void;

  // UI actions
  setSelectedAction: (action: PlayerAction | null) => void;
  setRaiseAmount: (amount: number) => void;

  // Derived helpers (computed at call-site to avoid stale closures)
  getMyPlayer: () => Player | null;
  getIsMyTurn: () => boolean;

  reset: () => void;
}

const initialState = {
  gameState: null,
  players: [],
  myPlayerId: null,
  isConnected: false,
  lastError: null,
  selectedAction: null,
  raiseAmount: 0,
} satisfies Partial<GameStore>;

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setGameState: (gameState) => set({ gameState }, false, "setGameState"),

      setPlayers: (players) => set({ players }, false, "setPlayers"),

      addPlayer: (player) =>
        set((s) => ({ players: [...s.players, player] }), false, "addPlayer"),

      removePlayer: (playerId) =>
        set(
          (s) => ({ players: s.players.filter((p) => p.id !== playerId) }),
          false,
          "removePlayer"
        ),

      updatePlayer: (playerId, updates) =>
        set(
          (s) => ({
            players: s.players.map((p) =>
              p.id === playerId ? { ...p, ...updates } : p
            ),
          }),
          false,
          "updatePlayer"
        ),

      setMyPlayerId: (myPlayerId) =>
        set({ myPlayerId }, false, "setMyPlayerId"),

      setConnected: (isConnected) =>
        set({ isConnected }, false, "setConnected"),

      setError: (lastError) =>
        set({ lastError }, false, "setError"),

      applyAction: (playerId, action, amount) =>
        set(
          (s) => {
            if (!s.gameState) return s;
            const lastAction: GameAction = {
              type: action,
              playerId,
              amount,
              timestamp: new Date(),
            };
            return { gameState: { ...s.gameState, lastAction } };
          },
          false,
          "applyAction"
        ),

      setSelectedAction: (selectedAction) =>
        set({ selectedAction }, false, "setSelectedAction"),

      setRaiseAmount: (raiseAmount) =>
        set({ raiseAmount }, false, "setRaiseAmount"),

      getMyPlayer: () => {
        const { players, myPlayerId } = get();
        return players.find((p) => p.id === myPlayerId) ?? null;
      },

      getIsMyTurn: () => {
        const { gameState, myPlayerId } = get();
        return gameState?.currentPlayerId === myPlayerId;
      },

      reset: () => set(initialState, false, "reset"),
    }),
    { name: "GameStore" }
  )
);
