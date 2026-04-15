"use client";

import Link from "next/link";
import { Users, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameRoom } from "@/types/game";

interface RoomCardProps {
  room: GameRoom;
}

const PHASE_LABELS: Record<GameRoom["phase"], string> = {
  waiting: "Waiting",
  ante: "Ante",
  "third-street": "3rd Street",
  "fourth-street": "4th Street",
  "fifth-street": "5th Street",
  "sixth-street": "6th Street",
  "seventh-street": "7th Street",
  showdown: "Showdown",
  ended: "Ended",
};

export function RoomCard({ room }: RoomCardProps) {
  const isFull = room.playerCount >= room.maxPlayers;

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{room.name}</h3>
              {room.isPrivate && <Lock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />}
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Ante {room.ante} · Bring-in {room.bringIn} · {PHASE_LABELS[room.phase]}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={cn("flex items-center gap-1 text-sm", isFull ? "text-red-400" : "text-zinc-400")}>
              <Users className="h-3.5 w-3.5" />
              {room.playerCount}/{room.maxPlayers}
            </span>
            <Button
              as={Link}
              href={`/game/${room.id}`}
              size="sm"
              variant="poker"
              disabled={isFull}
            >
              Join
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
