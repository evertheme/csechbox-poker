import { create } from "zustand";
import type { GameRoom } from "@/types/game";

interface LobbyStore {
  rooms: GameRoom[];
  isLoading: boolean;
  searchQuery: string;
  setRooms: (rooms: GameRoom[]) => void;
  addRoom: (room: GameRoom) => void;
  updateRoom: (room: GameRoom) => void;
  removeRoom: (roomId: string) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  rooms: [],
  isLoading: false,
  searchQuery: "",
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
  updateRoom: (room) =>
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === room.id ? room : r)) })),
  removeRoom: (roomId) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== roomId) })),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
