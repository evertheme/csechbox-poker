-- Profiles, games, and game_players with Row Level Security
-- Note: column avatar_url matches the app (src/lib/auth/supabase-profile.ts).

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  chips INTEGER NOT NULL DEFAULT 10000,
  stats JSONB NOT NULL DEFAULT '{"gamesPlayed":0,"gamesWon":0,"totalWinnings":0,"biggestPot":0,"handsPlayed":0,"handsFolded":0,"winRate":0}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_by UUID REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create game_players table
CREATE TABLE public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games (id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  position INTEGER,
  chips INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, player_id),
  UNIQUE (game_id, position)
);

CREATE INDEX idx_games_status ON public.games (status);
CREATE INDEX idx_game_players_game_id ON public.game_players (game_id);
CREATE INDEX idx_game_players_player_id ON public.game_players (player_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- profiles: sign-up insert, read/update own row; read others for lobby (adjust if you want stricter privacy)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- games: list/join flows
CREATE POLICY "games_select_authenticated"
  ON public.games
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "games_insert_authenticated"
  ON public.games
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by IS NULL OR created_by = auth.uid());

CREATE POLICY "games_update_creator"
  ON public.games
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- game_players: participants can see rows; users insert/update their own membership
CREATE POLICY "game_players_select_authenticated"
  ON public.game_players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "game_players_insert_self"
  ON public.game_players
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "game_players_update_self"
  ON public.game_players
  FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "game_players_delete_self"
  ON public.game_players
  FOR DELETE
  TO authenticated
  USING (player_id = auth.uid());
