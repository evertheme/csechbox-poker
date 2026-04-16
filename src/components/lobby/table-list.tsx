"use client";

import { useEffect } from "react";
import { useLobbyStore } from "@/store/lobby-store";
import { useSocket } from "@/hooks/use-socket";
import { TableCard } from "./table-card";
import { Skeleton } from "@/components/ui/skeleton";

export function TableList() {
  const { socket } = useSocket();
  const { tables, isLoading, searchQuery } = useLobbyStore();

  useEffect(() => {
    if (socket?.connected) socket.emit("table:list");
  }, [socket]);

  const filtered = tables.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-500">
        <span className="text-4xl">🃏</span>
        <p className="text-sm">No tables found. Create a game to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}
    </div>
  );
}
