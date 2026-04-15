"use client";

import { use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSocket } from "@/hooks/use-socket";
import { socketClient } from "@/lib/socket";
import { useGameStore } from "@/store/game-store";
import { useAuthStore } from "@/store/auth-store";
import { PokerTable } from "@/components/game/poker-table";
import { ActionPanel } from "@/components/game/action-panel";
import { GameInfo } from "@/components/game/game-info";
import { PlayerList } from "@/components/game/player-list";
import { ChatPanel } from "@/components/game/chat-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GamePageProps {
  params: Promise<{ roomId: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const user = useAuthStore((state) => state.user);
  const gameState = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const prevErr = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (lastError && lastError !== prevErr.current) {
      prevErr.current = lastError;
      toast.error("Game error", { description: lastError });
    }
    if (!lastError) prevErr.current = null;
  }, [lastError]);

  const handleLeaveRoom = () => {
    const s = socket ?? socketClient.getSocket();
    s?.emit("leave-room", roomId);
    router.push("/lobby");
  };

  const handleStartGame = () => {
    const s = socket ?? socketClient.getSocket();
    s?.emit("start-game", roomId);
  };

  if (!user) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4">
        <p className="text-lg text-white">Connecting…</p>
        <p className="text-sm text-zinc-400">You need a live socket to play.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-white/10 bg-black/20 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leave table
          </Button>

          <div className="text-center text-white">
            <p className="text-sm text-white/60">Room ID</p>
            <p className="font-mono text-sm font-bold">{roomId}</p>
          </div>

          {gameState?.phase === "waiting" && (
            <Button variant="poker" size="sm" onClick={handleStartGame}>
              Start game
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="hidden space-y-4 lg:block lg:w-64">
          <GameInfo />
          <PlayerList />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <PokerTable
            gameId={roomId}
            gameState={gameState}
            currentUserId={user.id}
            showBettingControls={false}
          />
          <ActionPanel
            roomId={roomId}
            gameState={gameState}
            currentUserId={user.id}
          />
        </div>

        <div className="hidden lg:block lg:w-64">
          <ChatPanel roomId={roomId} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 p-4 backdrop-blur-sm lg:hidden">
        <GameInfo compact />
        <div className="mt-3">
          <PlayerList />
        </div>
        <div className="mt-4">
          <ChatPanel roomId={roomId} />
        </div>
      </div>
    </div>
  );
}
