"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n-provider";

/**
 * Cookie consent, in the only form that is actually lawful under ePrivacy:
 * nothing non-essential runs until a choice is made, and refusing is one
 * click, in the same visual weight as accepting.
 *
 * The choice lives in localStorage rather than a cookie, because storing
 * "no cookies please" in a cookie is a joke the regulator has heard. The
 * session and locale cookies are strictly necessary and are not covered by
 * this banner — that is stated in the privacy policy rather than smuggled
 * past the reader here.
 *
 * `window.__q86Consent` is what M6's analytics loader will read; until it
 * is "granted", no analytics script is inserted at all.
 */

export const CONSENT_KEY = "q86-consent-analytics";

type Choice = "granted" | "denied" | null;

function read(): Choice {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // A privacy-hardened browser can throw on access. Treat it as "no
    // answer yet" and keep the page working.
    return null;
  }
}

function write(choice: Exclude<Choice, null>) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* Nothing to do: the page must still work without storage. */
  }
  window.dispatchEvent(new CustomEvent("q86-consent", { detail: choice }));
}

export function CookieBanner() {
  const t = useT();
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(read());
    setReady(true);
    const onOpen = () => setChoice(null);
    window.addEventListener("q86-consent-reopen", onOpen);
    return () => window.removeEventListener("q86-consent-reopen", onOpen);
  }, []);

  // Rendered only after mount, so the server never guesses a choice it
  // cannot see and the markup never flashes the wrong state.
  if (!ready || choice !== null) return null;

  function decide(next: "granted" | "denied") {
    write(next);
    setChoice(next);
  }

  return (
    <div
      role="dialog"
      aria-label={t("cookies.title")}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[640px] rounded-card border border-grid bg-surface p-4 shadow-ambient sm:inset-x-6 sm:bottom-6"
    >
      <p className="text-sm">
        <span className="font-medium">{t("cookies.title")}.</span>{" "}
        <span className="text-graphite">{t("cookies.body")}</span>{" "}
        <Link href="/integritetspolicy" className="text-ballpoint underline">
          {t("cookies.more")}
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="rounded-control bg-ink px-3 py-2 text-sm font-medium text-paper"
        >
          {t("cookies.accept")}
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="rounded-control border border-grid px-3 py-2 text-sm font-medium"
        >
          {t("cookies.reject")}
        </button>
      </div>
    </div>
  );
}

/** Lets a reader change their mind from the footer, which the law requires
 *  to be as easy as giving consent was. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          localStorage.removeItem(CONSENT_KEY);
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event("q86-consent-reopen"));
      }}
      className="text-[11px] text-graphite underline underline-offset-2 transition-colors hover:text-ink"
    >
      {label}
    </button>
  );
}
