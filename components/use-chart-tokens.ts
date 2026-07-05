"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export type ChartTokens = {
  ink: string;
  graphite: string;
  grid: string;
  ballpoint: string;
  redpen: string;
  amber: string;
  surface: string;
  onAccent: string;
};

const FALLBACK: ChartTokens = {
  ink: "#17181A",
  graphite: "#5E6268",
  grid: "#E9E6DD",
  ballpoint: "#2239C4",
  redpen: "#C63B2F",
  amber: "#8F5C0C",
  surface: "#FFFFFF",
  onAccent: "#FFFFFF",
};

function read(): ChartTokens {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
  return {
    ink: v("--ink", FALLBACK.ink),
    graphite: v("--graphite", FALLBACK.graphite),
    grid: v("--grid", FALLBACK.grid),
    ballpoint: v("--ballpoint", FALLBACK.ballpoint),
    redpen: v("--redpen", FALLBACK.redpen),
    amber: v("--amber", FALLBACK.amber),
    surface: v("--surface", FALLBACK.surface),
    onAccent: v("--on-accent", FALLBACK.onAccent),
  };
}

// useLayoutEffect on the client so the first read lands before paint —
// night desk never flashes the light FALLBACK — while SSR (where
// useLayoutEffect warns) keeps the plain effect.
const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Chart colors that follow the active theme (SVG attributes cannot use
 *  CSS variables, so charts read the resolved values and re-read on
 *  theme changes). */
export function useChartTokens(): ChartTokens {
  const [tokens, setTokens] = useState<ChartTokens>(FALLBACK);
  useClientLayoutEffect(() => {
    const update = () => setTokens(read());
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    window.addEventListener("q86-theme", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("q86-theme", update);
    };
  }, []);
  return tokens;
}
