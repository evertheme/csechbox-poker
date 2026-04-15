import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lobby — Poker",
};

export default function LobbyLayout({ children }: { children: ReactNode }) {
  return children;
}
