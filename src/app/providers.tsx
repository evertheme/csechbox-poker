"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { SocketProvider } from "@/hooks/use-socket";
import { Toaster } from "@/components/ui/toaster";

/** Restores Supabase session into the auth store on load (required for refresh). */
function AuthSessionProvider({ children }: { children: ReactNode }) {
  useAuth();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthSessionProvider>
        <SocketProvider>
          {children}
          <Toaster />
        </SocketProvider>
      </AuthSessionProvider>
    </ThemeProvider>
  );
}
