"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Key } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINKS: Array<{ href: string; key: Key }> = [
  { href: "/priser", key: "site.nav.pricing" },
  { href: "/diagnos", key: "site.nav.diagnostic" },
  { href: "/guider", key: "site.nav.guides" },
];

/**
 * The public header. Deliberately not the application's `Nav`: this one
 * carries no session, its job is to get a stranger to the diagnostic, and
 * it sits on a hairline rather than a filled bar.
 *
 * `signedIn` decides only the last link — a returning reader who is
 * already signed in should land in the app, not on a login form.
 */
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-grid bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-8 px-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          Q86
        </Link>

        <nav
          aria-label={t("site.nav.product")}
          className="hidden items-center gap-7 sm:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={cn(
                "text-sm transition-colors hover:text-ink",
                pathname.startsWith(link.href)
                  ? "font-medium text-ink"
                  : "text-graphite",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <LocaleToggle compact />
            <ThemeToggle />
          </div>
          {signedIn ? (
            <Link
              href="/idag"
              className="rounded-control bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              {t("nav.today")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-graphite transition-colors hover:text-ink sm:block"
              >
                {t("site.nav.signIn")}
              </Link>
              <Link
                href="/signup"
                className="rounded-control bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                {t("site.nav.start")}
              </Link>
            </>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-label={t("site.nav.menu")}
            onClick={() => setOpen((v) => !v)}
            className="rounded-control border border-grid px-2.5 py-2 sm:hidden"
          >
            <span aria-hidden className="block h-px w-4 bg-ink" />
            <span aria-hidden className="mt-1 block h-px w-4 bg-ink" />
            <span aria-hidden className="mt-1 block h-px w-4 bg-ink" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-grid px-5 pb-4 pt-3 sm:hidden">
          <nav aria-label={t("site.nav.product")} className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-ink"
              >
                {t(link.key)}
              </Link>
            ))}
            {!signedIn && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm text-ink"
              >
                {t("site.nav.signIn")}
              </Link>
            )}
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <LocaleToggle compact />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
