"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/use-socket";
import { socketClient } from "@/lib/socket";
import { supabase } from "@/lib/supabase/client";
import { fromGetRoomsRow, useLobbyStore } from "@/store/lobby-store";
import { useAuthStore } from "@/store/auth-store";
import { Users, Plus, DollarSign, TrendingUp } from "lucide-react";
import { CreateRoomDialog } from "@/components/lobby/create-room-dialog";

export default function LobbyPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const { socket, isConnected, connect } = useSocket();
  const { rooms, setRooms, setIsCreatingRoom } = useLobbyStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!isConnected) {
      void (async () => {
        const { data } = await supabase.auth.getSession();
        connect({ userId: user.id, accessToken: data.session?.access_token });
      })();
    }
  }, [isConnected, user, connect]);

  useEffect(() => {
    if (!user) return;
    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) return;

    setIsLoading(true);
    s.emit("get-rooms", (response) => {
      setIsLoading(false);
      if (!response) return;
      if (!response.success || !Array.isArray(response.rooms)) return;
      setRooms(response.rooms.map(fromGetRoomsRow));
    });
  }, [user, isConnected, socket, setRooms]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleJoinRoom = (roomId: string) => {
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) {
      toast.error("Connection error", {
        description: "Not connected to server",
      });
      return;
    }

    s.emit("join-room", roomId, (response) => {
      if (!response) {
        toast.error("Failed to join", {
          description: "No response from server",
        });
        return;
      }
      if (response.success) {
        toast.success("Joined room", {
          description: "Entering game…",
        });
        router.push(`/game/${roomId}`);
      } else {
        toast.error("Failed to join", {
          description: response.error,
        });
      }
    });
  };

  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
  };

  if (authLoading) {
    return (
      <div className="felt-texture flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-white">Loading session…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="felt-texture min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Game Lobby</h1>
            <p className="mt-1 text-green-100">
              {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </p>
          </div>
          <Button size="lg" onClick={handleCreateRoom} className="gap-2">
            <Plus className="h-5 w-5" />
            Create Room
          </Button>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/90">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <p className="text-2xl font-bold text-white">{user.username}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Your chips</p>
              <p className="text-2xl font-bold text-emerald-500">
                {user.chips.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">
            Available rooms ({rooms.length})
          </h2>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-zinc-800 bg-zinc-900/90">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-900/90">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="mb-4 text-xl text-muted-foreground">No active rooms</p>
                <Button variant="poker" onClick={handleCreateRoom}>
                  Create the first room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className="border-zinc-800 bg-zinc-900/90 transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-white">
                      <span className="truncate">{room.name}</span>
                      <Badge
                        variant={
                          room.players >= room.maxPlayers ? "destructive" : "default"
                        }
                      >
                        {room.players}/{room.maxPlayers}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Room ID: {room.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Ante: ${room.config.ante}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>Buy-in: ${room.config.buyIn}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {room.players} {room.players === 1 ? "player" : "players"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="poker"
                      className="w-full"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={room.players >= room.maxPlayers}
                    >
                      {room.players >= room.maxPlayers ? "Full" : "Join room"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateRoomDialog />
    </div>
  );
}
