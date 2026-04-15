"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatChips } from "@/lib/utils";

export function Header() {
  const { user } = useAuthStore();

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/lobby" className="text-lg font-bold text-white tracking-tight">
          ♠ Poker
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              <span className="text-white font-medium">{user.username}</span>
              {" · "}
              <span className="text-green-400">{formatChips(user.chips)} chips</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
