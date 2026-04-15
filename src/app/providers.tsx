"use client";

import type { ReactNode } from "react";
import { SocketProvider } from "@/hooks/use-socket";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
