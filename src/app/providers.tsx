"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SocketProvider } from "@/hooks/use-socket";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SocketProvider>
        {children}
        <Toaster />
      </SocketProvider>
    </ThemeProvider>
  );
}
