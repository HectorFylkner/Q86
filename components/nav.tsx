"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
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

/** The daily loop, thumb-reachable on phones. */
const TAB_LINKS = [
  { href: "/", label: "Today" },
  { href: "/drill", label: "Drill" },
  { href: "/timed", label: "Timed" },
  { href: "/deck", label: "Deck" },
  { href: "/analytics", label: "Stats" },
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
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Phone-only fixed bottom tab bar. Rendered outside the sticky header:
 *  backdrop-filter on an ancestor would turn position:fixed into
 *  header-relative positioning. */
export function BottomTabs() {
  const pathname = usePathname();
  return (
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-grid bg-paper/95 backdrop-blur-sm sm:hidden">
        {TAB_LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-[52px] flex-1 items-center justify-center text-[13px]",
                active ? "font-semibold text-ballpoint" : "text-graphite",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
  );
}
