import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a472a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2919" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Poker Stud",
    template: "%s | Poker Stud",
  },
  description: "Play 7-Card Stud Poker with friends online",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poker Stud",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen bg-felt`}>
        <Providers>
          <div className="safe-area flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
