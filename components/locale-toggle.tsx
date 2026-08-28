"use client";

import { useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import { LOCALE_NAMES, LOCALES, type Locale } from "@/lib/i18n/types";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

/**
 * Two languages, one control. The interface, the lessons and the coaching
 * follow it; question stems, answer choices and Data Sufficiency
 * statements never do — that boundary is the whole point (ADR 0004), so
 * the control says so rather than leaving it to be discovered.
 */
export function LocaleToggle({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const [pending, start] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("locale.label")}
      title={compact ? t("locale.note") : undefined}
      className="flex items-center gap-0.5 rounded-control border border-grid p-0.5"
    >
      {LOCALES.map((code: Locale) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          aria-pressed={locale === code}
          onClick={() => start(() => setLocaleAction(code))}
          className={cn(
            "rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] uppercase transition-colors",
            locale === code
              ? "bg-highlight font-semibold text-ink"
              : "text-graphite hover:text-ink",
            pending && "opacity-60",
          )}
        >
          {compact ? code : LOCALE_NAMES[code]}
        </button>
      ))}
    </div>
  );
}
