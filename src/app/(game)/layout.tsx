import type { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
  return <div className="felt-texture min-h-screen">{children}</div>;
}
