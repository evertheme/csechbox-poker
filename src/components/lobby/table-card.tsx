"use client";

import Link from "next/link";
import { Users, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GamePhase } from "@/types/game";
import type { TableInfo } from "@/store/lobby-store";

interface TableCardProps {
  table: TableInfo;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  waiting: "Waiting",
  ante: "Ante",
  dealing: "Dealing",
  betting: "In Progress",
  showdown: "Showdown",
  complete: "Complete",
};

export function TableCard({ table }: TableCardProps) {
  const phase = table.phase ?? "waiting";
  const bringIn = table.config.bringIn ?? 0;
  const isFull = table.players >= table.maxPlayers;

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{table.name}</h3>
              {table.isPrivate && <Lock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />}
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Ante {table.config.ante} · Bring-in {bringIn} · {PHASE_LABELS[phase]}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={cn("flex items-center gap-1 text-sm", isFull ? "text-red-400" : "text-zinc-400")}>
              <Users className="h-3.5 w-3.5" />
              {table.players}/{table.maxPlayers}
            </span>
            {isFull ? (
              <Button size="sm" variant="poker" disabled>
                Join
              </Button>
            ) : (
              <Button asChild size="sm" variant="poker">
                <Link href={`/game/${table.id}`}>Join</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
