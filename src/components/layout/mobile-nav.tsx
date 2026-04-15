"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media-query";

const NAV_ITEMS = [
  { label: "Lobby", href: "/lobby", icon: "🃏" },
];

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800 bg-zinc-950">
      <ul className="flex">
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs",
                pathname.startsWith(item.href) ? "text-white" : "text-zinc-500"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
