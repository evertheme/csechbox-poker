import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GameState, GameAction, PlayerAction } from "@/types/game";
import type { Player } from "@/types/player";

function computeTurnState(
  gameState: GameState | null,
  myPlayerId: string | null,
  players: Player[]
): { isMyTurn: boolean; currentPlayer: Player | null } {
  const isMyTurn =
    !!gameState &&
    gameState.phase === "betting" &&
    gameState.currentPlayerId === myPlayerId;
  const currentPlayer =
    gameState?.currentPlayerId != null
      ? players.find((p) => p.id === gameState.currentPlayerId) ?? null
      : null;
  return { isMyTurn, currentPlayer };
}

interface GameStore {
  gameState: GameState | null;
  players: Player[];
  myPlayerId: string | null;
  isConnected: boolean;
  lastError: string | null;

  /** True when it is the local player’s turn to act (betting phase). */
  isMyTurn: boolean;
  /** Player whose turn it is (from `players`), or null. */
  currentPlayer: Player | null;

  selectedAction: PlayerAction | null;
  raiseAmount: number;

  setGameState: (state: GameState) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setMyPlayerId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  applyAction: (playerId: string, action: PlayerAction, amount?: number) => void;

  setSelectedAction: (action: PlayerAction | null) => void;
  setRaiseAmount: (amount: number) => void;

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
  isMyTurn: false,
  currentPlayer: null,
  selectedAction: null,
  raiseAmount: 0,
} satisfies Partial<GameStore>;

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setGameState: (gameState) =>
        set((s) => {
          const { isMyTurn, currentPlayer } = computeTurnState(
            gameState,
            s.myPlayerId,
            s.players
          );
          return { gameState, isMyTurn, currentPlayer };
        }, false, "setGameState"),

      setIsMyTurn: (isMyTurn) => set({ isMyTurn }, false, "setIsMyTurn"),

      setPlayers: (players) =>
        set((s) => {
          const { isMyTurn, currentPlayer } = computeTurnState(
            s.gameState,
            s.myPlayerId,
            players
          );
          return { players, isMyTurn, currentPlayer };
        }, false, "setPlayers"),

      addPlayer: (player) =>
        set((s) => {
          const players = [...s.players, player];
          const { isMyTurn, currentPlayer } = computeTurnState(
            s.gameState,
            s.myPlayerId,
            players
          );
          return { players, isMyTurn, currentPlayer };
        }, false, "addPlayer"),

      removePlayer: (playerId) =>
        set((s) => {
          const players = s.players.filter((p) => p.id !== playerId);
          const { isMyTurn, currentPlayer } = computeTurnState(
            s.gameState,
            s.myPlayerId,
            players
          );
          return { players, isMyTurn, currentPlayer };
        }, false, "removePlayer"),

      updatePlayer: (playerId, updates) =>
        set((s) => {
          const players = s.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          );
          const { isMyTurn, currentPlayer } = computeTurnState(
            s.gameState,
            s.myPlayerId,
            players
          );
          return { players, isMyTurn, currentPlayer };
        }, false, "updatePlayer"),

      setMyPlayerId: (myPlayerId) =>
        set((s) => {
          const { isMyTurn, currentPlayer } = computeTurnState(
            s.gameState,
            myPlayerId,
            s.players
          );
          return { myPlayerId, isMyTurn, currentPlayer };
        }, false, "setMyPlayerId"),

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
            const gameState = { ...s.gameState, lastAction };
            const { isMyTurn, currentPlayer } = computeTurnState(
              gameState,
              s.myPlayerId,
              s.players
            );
            return { gameState, isMyTurn, currentPlayer };
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

      getIsMyTurn: () => get().isMyTurn,

      reset: () => set(initialState, false, "reset"),
    }),
    { name: "GameStore" }
  )
);
