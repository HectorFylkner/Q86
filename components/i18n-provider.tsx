"use client";

import { createContext, useContext, useMemo } from "react";
import {
  getDictionary,
  translator,
  type Dictionary,
  type Key,
  type Translate,
} from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";

/**
 * The active locale, handed to client components from the server.
 *
 * The whole catalog crosses the boundary as plain data — it is nested
 * strings, nothing more — so a client component gets the same `t()` the
 * server used, with no fetch and no second source of truth.
 */
type I18nValue = { locale: Locale; dictionary: Dictionary };

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  dictionary: getDictionary(DEFAULT_LOCALE),
});

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

export function useT(): Translate {
  const { locale } = useContext(I18nContext);
  return useMemo(() => translator(locale), [locale]);
}

/** For components that need both, which is most of the formatted ones. */
export function useI18n(): { locale: Locale; t: Translate } {
  const { locale } = useContext(I18nContext);
  return useMemo(() => ({ locale, t: translator(locale) }), [locale]);
}

export type { Key };
