"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/** Seven destinations; grouped sections carry their own tab bars.
 *  `routes` lists every path that should light the entry up. */
const LINKS = [
  { href: "/", label: "Today", routes: ["/"] },
  { href: "/learn", label: "Learn", routes: ["/learn"] },
  { href: "/drill", label: "Drill", routes: ["/drill", "/postmortem"] },
  { href: "/timed", label: "Timed", routes: ["/timed"] },
  { href: "/deck", label: "Review", routes: ["/deck", "/queue"] },
  { href: "/patterns", label: "Trainers", routes: ["/patterns", "/decide"] },
  {
    href: "/mastery",
    label: "Progress",
    routes: ["/mastery", "/analytics", "/import"],
  },
];

/** The daily loop, thumb-reachable on phones. */
const TAB_LINKS = [
  { href: "/", label: "Today", routes: ["/"] },
  { href: "/drill", label: "Drill", routes: ["/drill", "/postmortem"] },
  { href: "/timed", label: "Timed", routes: ["/timed"] },
  { href: "/deck", label: "Review", routes: ["/deck", "/queue"] },
  {
    href: "/analytics",
    label: "Stats",
    routes: ["/analytics", "/mastery", "/import"],
  },
];

function isActive(routes: string[], pathname: string): boolean {
  return routes.some((r) =>
    r === "/" ? pathname === "/" : pathname.startsWith(r),
  );
}

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
        <nav
          aria-label="Primary"
          className="flex flex-1 items-center gap-1 overflow-x-auto"
        >
          {LINKS.map((link) => {
            const active = isActive(link.routes, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-control px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-150",
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
      <nav
        aria-label="Quick access"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-grid bg-paper/95 backdrop-blur-sm sm:hidden"
      >
        {TAB_LINKS.map((link) => {
          const active = isActive(link.routes, pathname);
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
