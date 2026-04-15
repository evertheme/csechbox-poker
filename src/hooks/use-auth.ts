"use client";

import { useEffect } from "react";
import { supabaseUserToPlayerProfile } from "@/lib/auth/supabase-profile";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(supabaseUserToPlayerProfile(data.session.user));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? supabaseUserToPlayerProfile(session.user) : null);
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser, setLoading]);

  return { user, isLoading, logout };
}
