"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target } from "@phosphor-icons/react";
import {
  BOTTOM_LINKS,
  isNavigationItemActive,
  PRIMARY_LINKS,
} from "@/components/navigation";
import { QuickLauncher } from "@/components/quick-launcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-grid bg-paper/92 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link
          href="/"
          aria-label="Q86 today"
          className="group flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ballpoint/30 bg-ballpoint/10 text-ballpoint transition-colors group-hover:bg-ballpoint/15">
            <Target size={18} weight="bold" aria-hidden />
          </span>
          <span>Q86</span>
          <span className="hidden text-xs font-normal text-graphite xl:inline">
            the target is the name
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="session-hide hidden flex-1 items-center gap-0.5 overflow-x-auto sm:flex"
        >
          {PRIMARY_LINKS.map((link) => {
            const active = isNavigationItemActive(link.routes, pathname);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-control px-2 text-[13px] transition-colors duration-150 md:px-2.5",
                  active
                    ? "bg-highlight font-medium text-ink shadow-[inset_0_-1px_0_color-mix(in_srgb,var(--ballpoint)_45%,transparent)]"
                    : "text-graphite hover:bg-highlight/60 hover:text-ink",
                )}
              >
                <Icon
                  size={16}
                  weight={active ? "fill" : "regular"}
                  className={active ? "text-ballpoint" : undefined}
                  aria-hidden
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1 sm:hidden" />
        <span className="session-label hidden flex-1 justify-end font-mono text-[11px] text-graphite">
          Focus session · Q86 exits
        </span>
        <div className="session-hide">
          <QuickLauncher />
        </div>
        <div className="session-hide">
          <ThemeToggle />
        </div>
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
      className="session-hide fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-grid bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_36px_-30px_rgba(23,24,26,0.65)] backdrop-blur-md sm:hidden"
    >
      {BOTTOM_LINKS.map((link) => {
        const active = isNavigationItemActive(link.routes, pathname);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] transition-colors",
              active ? "font-semibold text-ballpoint" : "text-graphite",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-transparent",
                active && "bg-ballpoint",
              )}
            />
            <Icon size={20} weight={active ? "fill" : "regular"} aria-hidden />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
