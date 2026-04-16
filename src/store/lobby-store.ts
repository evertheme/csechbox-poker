import { create } from "zustand";
import type { GameConfig, GamePhase, LobbyTable } from "@/types/game";

export interface TableInfo {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  config: {
    ante: number;
    smallBet: number;
    bigBet: number;
    buyIn: number;
    bringIn?: number;
  };
  phase?: GamePhase;
  isPrivate?: boolean;
}

interface LobbyStore {
  tables: TableInfo[];
  selectedTable: TableInfo | null;
  isCreateGameOpen: boolean;
  isLoading: boolean;
  searchQuery: string;

  setTables: (tables: TableInfo[]) => void;
  addTable: (table: TableInfo) => void;
  removeTable: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<TableInfo>) => void;
  setSelectedTable: (table: TableInfo | null) => void;
  setCreateGameOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  tables: [],
  selectedTable: null,
  isCreateGameOpen: false,
  isLoading: false,
  searchQuery: "",

  setTables: (tables) => set({ tables }),

  addTable: (table) =>
    set((state) => ({
      tables: [...state.tables, table],
    })),

  removeTable: (tableId) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== tableId),
      selectedTable:
        state.selectedTable?.id === tableId ? null : state.selectedTable,
    })),

  updateTable: (tableId, updates) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, ...updates } : t,
      ),
      selectedTable:
        state.selectedTable?.id === tableId && state.selectedTable
          ? { ...state.selectedTable, ...updates }
          : state.selectedTable,
    })),

  setSelectedTable: (table) => set({ selectedTable: table }),

  setCreateGameOpen: (open) => set({ isCreateGameOpen: open }),

  setLoading: (loading) => set({ isLoading: loading }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));

/** Map server `list-tables` row into `TableInfo`. */
export function fromListedTableRow(row: {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  config: GameConfig;
}): TableInfo {
  return {
    id: row.id,
    name: row.name,
    players: row.players,
    maxPlayers: row.maxPlayers,
    config: {
      ante: row.config.ante,
      smallBet: row.config.smallBet,
      bigBet: row.config.bigBet,
      buyIn: row.config.buyIn,
      bringIn: row.config.bringIn,
    },
  };
}

/** Map server broadcast `LobbyTable` payloads into lobby `TableInfo`. */
export function toTableInfo(table: LobbyTable): TableInfo {
  return {
    id: table.id,
    name: table.name,
    players: table.playerCount,
    maxPlayers: table.config.maxPlayers,
    config: {
      ante: table.config.ante,
      smallBet: table.config.smallBet,
      bigBet: table.config.bigBet,
      buyIn: table.config.buyIn,
      bringIn: table.config.bringIn,
    },
    phase: table.phase,
    isPrivate: table.isPrivate,
  };
}
