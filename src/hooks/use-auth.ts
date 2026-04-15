"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/player";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, signOut } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        setUser({
          id: u.id,
          email: u.email ?? "",
          username: (u.user_metadata["username"] as string | undefined) ?? u.email ?? "",
          chips: (u.user_metadata["chips"] as number | undefined) ?? 1000,
          gamesPlayed: 0,
          gamesWon: 0,
          createdAt: u.created_at,
        } satisfies AuthUser);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        return;
      }
      const u = session.user;
      setUser({
        id: u.id,
        email: u.email ?? "",
        username: (u.user_metadata["username"] as string | undefined) ?? u.email ?? "",
        chips: (u.user_metadata["chips"] as number | undefined) ?? 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        createdAt: u.created_at,
      } satisfies AuthUser);
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser, setLoading]);

  return { user, isLoading, signOut };
}
