import type { Metadata } from "next";
import type { ReactNode } from "react";

interface GameRoomLayoutProps {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
}

export async function generateMetadata({ params }: GameRoomLayoutProps): Promise<Metadata> {
  const { roomId } = await params;
  return { title: `Game ${roomId} — Poker` };
}

export default function GameRoomLayout({ children }: GameRoomLayoutProps) {
  return children;
}
