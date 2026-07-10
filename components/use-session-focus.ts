"use client";

import { useEffect } from "react";

/**
 * Quiet the global shell during active work and protect in-progress state
 * from accidental tab closes or link navigation. Timed answers are still
 * committed at section submission, so the warning is deliberately explicit.
 */
export function useSessionFocus(active: boolean, label: string) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    root.dataset.session = "focus";
    root.dataset.sessionLabel = label;

    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function protectLinkNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.href === window.location.href
      ) {
        return;
      }
      const confirmed = window.confirm(
        `${label}. Leave this session? The current unanswered question will not be preserved.`,
      );
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", protectLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", protectLinkNavigation, true);
      delete root.dataset.session;
      delete root.dataset.sessionLabel;
    };
  }, [active, label]);
}
