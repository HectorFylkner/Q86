"use client";

import { useEffect, useState } from "react";

export type ChartTokens = {
  ink: string;
  graphite: string;
  grid: string;
  surface: string;
  paper: string;
  ballpoint: string;
  redpen: string;
  amber: string;
  highlight: string;
  /** Categorical series, fixed order, never cycled. */
  series: [string, string, string, string];
  /** Outcome status — always paired with a shape or a label. */
  good: string;
  bad: string;
  /** Sequential magnitude ramp, light → dark. */
  ramp: [string, string, string, string];
};

const FALLBACK: ChartTokens = {
  ink: "#17181a",
  graphite: "#5e6268",
  grid: "#e9e6dd",
  surface: "#ffffff",
  paper: "#fafaf7",
  ballpoint: "#2239c4",
  redpen: "#c63b2f",
  amber: "#a16a1b",
  highlight: "#f5efd9",
  series: ["#2f4fd8", "#cf3b2c", "#0f8f7a", "#8a4bc9"],
  good: "#1d8659",
  bad: "#cf3b2c",
  ramp: ["#8293c3", "#6076cf", "#3f56bd", "#233690"],
};

function read(): ChartTokens {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
  return {
    ink: v("--ink", FALLBACK.ink),
    graphite: v("--graphite", FALLBACK.graphite),
    grid: v("--grid", FALLBACK.grid),
    surface: v("--surface", FALLBACK.surface),
    paper: v("--paper", FALLBACK.paper),
    ballpoint: v("--ballpoint", FALLBACK.ballpoint),
    redpen: v("--redpen", FALLBACK.redpen),
    amber: v("--amber", FALLBACK.amber),
    highlight: v("--highlight", FALLBACK.highlight),
    series: [
      v("--series-1", FALLBACK.series[0]),
      v("--series-2", FALLBACK.series[1]),
      v("--series-3", FALLBACK.series[2]),
      v("--series-4", FALLBACK.series[3]),
    ],
    good: v("--good", FALLBACK.good),
    bad: v("--bad", FALLBACK.bad),
    ramp: [
      v("--ramp-1", FALLBACK.ramp[0]),
      v("--ramp-2", FALLBACK.ramp[1]),
      v("--ramp-3", FALLBACK.ramp[2]),
      v("--ramp-4", FALLBACK.ramp[3]),
    ],
  };
}

/**
 * Chart colours that follow the active theme.
 *
 * SVG presentation attributes cannot take CSS variables, so charts read
 * the resolved values instead. The subscription list is what makes them
 * track the theme *live* rather than only on mount: the OS preference,
 * the app's own toggle event, and a MutationObserver on the `data-theme`
 * attribute the toggle writes — a theme change from any of the three
 * repaints every chart without a reload.
 */
export function useChartTokens(): ChartTokens {
  const [tokens, setTokens] = useState<ChartTokens>(FALLBACK);
  useEffect(() => {
    const update = () => setTokens(read());
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    window.addEventListener("q86-theme", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("q86-theme", update);
      observer.disconnect();
    };
  }, []);
  return tokens;
}

/** Whether the resolved theme is the dark one — for marks that need to
 *  know (a wash's opacity, a ring's colour). */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const update = () => {
      const attr = document.documentElement.dataset.theme;
      setDark(
        attr === "dark" ||
          (attr !== "light" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches),
      );
    };
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    window.addEventListener("q86-theme", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("q86-theme", update);
      observer.disconnect();
    };
  }, []);
  return dark;
}
