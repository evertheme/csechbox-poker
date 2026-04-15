import type { Metadata } from "next";
import { RoomList } from "@/components/lobby/room-list";
import { CreateRoomDialog } from "@/components/lobby/create-room-dialog";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Lobby — Poker",
};

export default function LobbyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
            <CreateRoomDialog />
          </div>
          <RoomList />
        </div>
      </main>
    </div>
  );
}
