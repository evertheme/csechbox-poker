"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { PlayerProfile, PlayerStats } from "@/types/player";

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalWinnings: 0,
  biggestPot: 0,
  handsPlayed: 0,
  handsFolded: 0,
  winRate: 0,
};

function supabaseUserToProfile(u: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
  created_at: string;
}): PlayerProfile {
  return {
    id: u.id,
    email: u.email ?? "",
    username:
      (u.user_metadata["username"] as string | undefined) ?? u.email ?? "",
    avatarUrl: u.user_metadata["avatar_url"] as string | undefined,
    chips: (u.user_metadata["chips"] as number | undefined) ?? 1000,
    stats: (u.user_metadata["stats"] as PlayerStats | undefined) ?? DEFAULT_STATS,
    createdAt: new Date(u.created_at),
    lastActive: new Date(),
  };
}

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(supabaseUserToProfile(data.session.user));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? supabaseUserToProfile(session.user) : null);
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser, setLoading]);

  return { user, isLoading, logout };
}
