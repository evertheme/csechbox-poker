import { create } from "zustand";
import type { GamePhase, GameRoom } from "@/types/game";

export interface RoomInfo {
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
  rooms: RoomInfo[];
  selectedRoom: RoomInfo | null;
  isCreatingRoom: boolean;
  isLoading: boolean;
  searchQuery: string;

  setRooms: (rooms: RoomInfo[]) => void;
  addRoom: (room: RoomInfo) => void;
  removeRoom: (roomId: string) => void;
  updateRoom: (roomId: string, updates: Partial<RoomInfo>) => void;
  setSelectedRoom: (room: RoomInfo | null) => void;
  setIsCreatingRoom: (isCreating: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  rooms: [],
  selectedRoom: null,
  isCreatingRoom: false,
  isLoading: false,
  searchQuery: "",

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, room],
    })),

  removeRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== roomId),
      selectedRoom:
        state.selectedRoom?.id === roomId ? null : state.selectedRoom,
    })),

  updateRoom: (roomId, updates) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, ...updates } : r,
      ),
      selectedRoom:
        state.selectedRoom?.id === roomId && state.selectedRoom
          ? { ...state.selectedRoom, ...updates }
          : state.selectedRoom,
    })),

  setSelectedRoom: (room) => set({ selectedRoom: room }),

  setIsCreatingRoom: (isCreating) => set({ isCreatingRoom: isCreating }),

  setLoading: (loading) => set({ isLoading: loading }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));

/** Map server `GameRoom` payloads into lobby `RoomInfo`. */
export function toRoomInfo(room: GameRoom): RoomInfo {
  return {
    id: room.id,
    name: room.name,
    players: room.playerCount,
    maxPlayers: room.config.maxPlayers,
    config: {
      ante: room.config.ante,
      smallBet: room.config.smallBet,
      bigBet: room.config.bigBet,
      buyIn: room.config.buyIn,
      bringIn: room.config.bringIn,
    },
    phase: room.phase,
    isPrivate: room.isPrivate,
  };
}
