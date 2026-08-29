"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Key } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Seven destinations; grouped sections carry their own tab bars.
 *  `routes` lists every path that should light the entry up. */
const LINKS: Array<{ href: string; key: Key; routes: string[] }> = [
  { href: "/idag", key: "nav.today", routes: ["/idag"] },
  { href: "/learn", key: "nav.learn", routes: ["/learn"] },
  { href: "/drill", key: "nav.drill", routes: ["/drill", "/postmortem"] },
  { href: "/timed", key: "nav.timed", routes: ["/timed"] },
  { href: "/deck", key: "nav.review", routes: ["/deck", "/queue"] },
  { href: "/patterns", key: "nav.trainers", routes: ["/patterns", "/decide"] },
  {
    href: "/mastery",
    key: "nav.progress",
    routes: ["/mastery", "/analytics", "/import"],
  },
];

/** The daily loop, thumb-reachable on phones. */
const TAB_LINKS: Array<{ href: string; key: Key; routes: string[] }> = [
  { href: "/idag", key: "nav.today", routes: ["/idag"] },
  { href: "/drill", key: "nav.drill", routes: ["/drill", "/postmortem"] },
  { href: "/timed", key: "nav.timed", routes: ["/timed"] },
  { href: "/deck", key: "nav.review", routes: ["/deck", "/queue"] },
  {
    href: "/analytics",
    key: "nav.stats",
    routes: ["/analytics", "/mastery", "/import"],
  },
];

function isActive(routes: string[], pathname: string): boolean {
  return routes.some((r) => pathname.startsWith(r));
}

export function Nav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-grid bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/idag"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          Q86
          <span className="ml-2 hidden text-xs font-normal text-graphite sm:inline">
            {t("nav.tagline")}
          </span>
        </Link>
        <nav
          aria-label={t("nav.primary")}
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
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
        <LocaleToggle compact />
        <ThemeToggle />
        <AccountMenu email={userEmail} />
      </div>
    </header>
  );
}

/**
 * Identity and the way out. Sign-out is a POST form, never a link: a GET
 * logout endpoint can be triggered by any page that can embed an image.
 */
function AccountMenu({ email }: { email: string }) {
  const t = useT();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        title={email}
        className="hidden max-w-[14ch] truncate font-mono text-[11px] text-graphite lg:inline"
      >
        {email}
      </span>
      <Link
        href="/konto"
        className="rounded-control border border-grid px-2.5 py-1 text-xs text-graphite transition-colors hover:border-graphite/50 hover:text-ink"
      >
        {t("nav.account")}
      </Link>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded-control border border-grid px-2.5 py-1 text-xs text-graphite transition-colors hover:border-graphite/50 hover:text-ink"
        >
          {t("nav.signOut")}
        </button>
      </form>
    </div>
  );
}

/** Phone-only fixed bottom tab bar. Rendered outside the sticky header:
 *  backdrop-filter on an ancestor would turn position:fixed into
 *  header-relative positioning. */
export function BottomTabs() {
  const pathname = usePathname();
  const t = useT();
  return (
      <nav
        aria-label={t("nav.quickAccess")}
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
              {t(link.key)}
            </Link>
          );
        })}
      </nav>
  );
}
