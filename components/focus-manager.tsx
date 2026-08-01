"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Focus on route change.
 *
 * Client-side navigation swaps the document under the user without
 * moving focus, so a keyboard user stays parked on a link that no longer
 * exists and a screen reader announces nothing at all. This moves focus
 * to the new page's heading — a real, visible element at the top of the
 * content, never a hidden sentinel — and lets the heading text be the
 * announcement.
 *
 * The first render is skipped: a full page load already starts focus at
 * the document, and stealing it there would fight the browser.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.querySelector("main");
    if (!main) return;
    const target =
      main.querySelector<HTMLElement>("h1") ??
      (main as HTMLElement);
    const hadTabIndex = target.hasAttribute("tabindex");
    if (!hadTabIndex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Leave the DOM as it was found, so the heading is not a tab stop.
    const drop = () => {
      if (!hadTabIndex) target.removeAttribute("tabindex");
      target.removeEventListener("blur", drop);
    };
    target.addEventListener("blur", drop);
  }, [pathname]);

  return null;
}

/** The first tab stop on every page: jump past the nav to the content. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only left-3 top-3 z-50 rounded-control border border-ballpoint bg-surface px-3 py-2 text-body font-medium text-ballpoint shadow-ambient focus:not-sr-only focus:fixed"
    >
      Skip to content
    </a>
  );
}
