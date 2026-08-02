"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * Five destinations, one verb each, identical on desktop and on a phone.
 *
 * It was seven, and the header and the phone tab bar disagreed about
 * which — the bar carried a "Stats" entry the header called "Progress",
 * and it had no Learn at all, so on a phone the curriculum could only be
 * reached by scrolling up into a horizontally-scrolling header. One list
 * used twice removes both problems.
 *
 * The cut follows what every durable study tool converges on: a short set
 * of verbs, with variants as tabs *inside* a destination rather than as
 * more destinations. Drill, timed sections and the two trainers are all
 * "answer questions under some condition", so they are one place with
 * four ways in. Import and backup is housekeeping, not a daily verb, so
 * it left the nav entirely and is linked from the two places that
 * actually need it.
 *
 * `routes` lists every path that should light the entry up.
 */
const LINKS = [
  { href: "/", label: "Today", routes: ["/"] },
  { href: "/learn", label: "Learn", routes: ["/learn"] },
  {
    href: "/drill",
    label: "Practice",
    routes: ["/drill", "/timed", "/patterns", "/decide", "/postmortem"],
  },
  { href: "/deck", label: "Review", routes: ["/deck", "/queue"] },
  {
    href: "/mastery",
    label: "Progress",
    routes: ["/mastery", "/analytics", "/import"],
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
          className="hidden flex-1 items-center gap-1 sm:flex"
        >
          {LINKS.map((link) => {
            const active = isActive(link.routes, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
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
        <div className="flex flex-1 justify-end sm:flex-none">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** The same five, thumb-reachable on phones. Rendered outside the sticky
 *  header: backdrop-filter on an ancestor would turn position:fixed into
 *  header-relative positioning. */
export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-grid bg-paper/95 backdrop-blur-sm sm:hidden"
    >
      {LINKS.map((link) => {
        const active = isActive(link.routes, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
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
