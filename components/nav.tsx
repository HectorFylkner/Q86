"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/drill", label: "Drill" },
  { href: "/mastery", label: "Mastery" },
  { href: "/timed", label: "Timed" },
  { href: "/queue", label: "Queue" },
  { href: "/deck", label: "Deck" },
  { href: "/decide", label: "Decide" },
  { href: "/patterns", label: "Patterns" },
  { href: "/analytics", label: "Analytics" },
  { href: "/import", label: "Import" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-grid bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          Q86
          <span className="ml-2 hidden text-xs font-normal text-graphite sm:inline">
            the target is the name
          </span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[6px] px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-150",
                  active
                    ? "bg-highlight font-medium text-ink"
                    : "text-graphite hover:bg-highlight/60 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
