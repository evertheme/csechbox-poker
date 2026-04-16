import type { Metadata } from "next";
import type { ReactNode } from "react";

interface GameTableLayoutProps {
  children: ReactNode;
  params: Promise<{ tableId: string }>;
}

export async function generateMetadata({ params }: GameTableLayoutProps): Promise<Metadata> {
  const { tableId } = await params;
  return { title: `Game ${tableId} — Poker` };
}

export default function GameTableLayout({ children }: GameTableLayoutProps) {
  return children;
}
