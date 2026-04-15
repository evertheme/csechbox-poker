import type { Metadata } from "next";
import { PokerTable } from "@/components/game/poker-table";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Game ${id} — Poker` };
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <PokerTable gameId={id} />
    </main>
  );
}
