import type { User } from "@supabase/supabase-js";
import type { PlayerProfile, PlayerStats } from "@/types/player";

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalWinnings: 0,
  biggestPot: 0,
  handsPlayed: 0,
  handsFolded: 0,
  winRate: 0,
};

export function supabaseUserToPlayerProfile(u: User): PlayerProfile {
  return {
    id: u.id,
    email: u.email ?? "",
    username:
      (u.user_metadata["username"] as string | undefined) ?? u.email ?? "",
    avatarUrl: u.user_metadata["avatar_url"] as string | undefined,
    chips: (u.user_metadata["chips"] as number | undefined) ?? 1000,
    stats:
      (u.user_metadata["stats"] as PlayerStats | undefined) ?? DEFAULT_STATS,
    createdAt: new Date(u.created_at),
    lastActive: new Date(),
  };
}

/** Map a `profiles` table row to `PlayerProfile`, falling back to session user fields. */
export function profileRowToPlayerProfile(
  row: Record<string, unknown>,
  sessionUser: User
): PlayerProfile {
  const base = supabaseUserToPlayerProfile(sessionUser);
  const rawStats = row["stats"];
  const stats =
    typeof rawStats === "object" && rawStats !== null
      ? { ...DEFAULT_STATS, ...(rawStats as Partial<PlayerStats>) }
      : base.stats;

  const createdRaw = row["created_at"];
  return {
    id: String(row["id"] ?? base.id),
    username: String(row["username"] ?? base.username),
    email: String(row["email"] ?? base.email),
    avatarUrl: (row["avatar_url"] as string | undefined) ?? base.avatarUrl,
    chips: typeof row["chips"] === "number" ? row["chips"] : base.chips,
    stats,
    createdAt:
      typeof createdRaw === "string" ? new Date(createdRaw) : base.createdAt,
    lastActive: new Date(),
  };
}
