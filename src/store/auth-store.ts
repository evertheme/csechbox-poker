import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { PlayerProfile } from "@/types/player";

/** Subset persisted to localStorage — no Date objects, no stats */
interface PersistedAuth {
  userId: string | null;
  username: string | null;
}

interface AuthStore {
  user: PlayerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: PlayerProfile | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  /** Alias kept for backward compat with use-auth.ts */
  setLoading: (loading: boolean) => void;
  logout: () => void;
  /** Alias kept for backward compat with use-auth.ts */
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "setUser"),

        setIsAuthenticated: (isAuthenticated) =>
          set({ isAuthenticated }, false, "setIsAuthenticated"),

        setIsLoading: (isLoading) =>
          set({ isLoading }, false, "setIsLoading"),

        setLoading: (isLoading) =>
          set({ isLoading }, false, "setLoading"),

        logout: () =>
          set({ user: null, isAuthenticated: false }, false, "logout"),

        signOut: () =>
          set({ user: null, isAuthenticated: false }, false, "signOut"),
      }),
      {
        name: "auth-storage",
        // Only persist non-Date, non-sensitive fields.
        // use-auth.ts re-hydrates the full PlayerProfile from Supabase on mount.
        partialize: (state): PersistedAuth => ({
          userId: state.user?.id ?? null,
          username: state.user?.username ?? null,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);
