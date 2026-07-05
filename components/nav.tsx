"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
    <header className="sticky top-0 z-40 border-b border-grid bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
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
        {/* Location grammar: the current section carries a sliding
            ballpoint underline — never a fill, never a weight change. */}
        <nav
          aria-label="Primary"
          className="flex flex-1 items-stretch gap-1 self-stretch overflow-x-auto"
        >
          {LINKS.map((link) => {
            const active = isActive(link.routes, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center whitespace-nowrap px-3 text-sm transition-colors duration-150",
                  active ? "text-ink" : "text-graphite hover:text-ink",
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 bottom-0 h-0.5 bg-ballpoint"
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    aria-hidden
                  />
                )}
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
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-grid bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden"
      >
        {TAB_LINKS.map((link) => {
          const active = isActive(link.routes, pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[52px] flex-1 items-center justify-center text-sm transition-colors duration-150",
                active ? "text-ballpoint" : "text-graphite",
              )}
            >
              {link.label}
              {active && (
                <motion.span
                  layoutId="bottom-tab-mark"
                  className="absolute inset-x-0 top-0 mx-auto h-0.5 w-8 bg-ballpoint"
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>
  );
}
