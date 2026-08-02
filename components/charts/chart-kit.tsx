"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTokens, type ChartTokens } from "@/components/use-chart-tokens";
import { cn } from "@/lib/utils";

/**
 * The shared chart layer.
 *
 * Axes, grid, tooltip, empty state, legend, figure frame and responsive
 * behaviour live here once, so a chart looks like Q86 by default rather
 * than by repetition. Every colour comes from the resolved design tokens
 * (see components/use-chart-tokens.ts) — no chart file carries a colour
 * literal, and a theme change repaints all of them live.
 *
 * Mark specs are fixed across the platform: 2px lines with round joins,
 * bars capped at 24px with a 4px rounded data-end, markers at r ≥ 4 with
 * a 2px surface ring, area washes at ~10% opacity, hairline solid grid.
 */

export const MARK = {
  lineWidth: 2,
  barSize: 22,
  barRadius: [4, 4, 0, 0] as [number, number, number, number],
  barRadiusH: [0, 4, 4, 0] as [number, number, number, number],
  dotRadius: 4,
  ringWidth: 2,
  areaOpacity: 0.1,
} as const;

/** A figure: heading, optional supporting line, and the plot itself. */
export function Figure({
  title,
  caption,
  actions,
  children,
  className,
  bleed = false,
}: {
  title: string;
  caption?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Let the plot run to the card edge (grids, heatmaps). */
  bleed?: boolean;
}) {
  return (
    <figure
      className={cn(
        "rounded-card border border-grid bg-surface shadow-ambient",
        bleed ? "overflow-hidden" : "p-4 sm:p-5",
        className,
      )}
    >
      <figcaption className={cn(bleed && "p-4 pb-0 sm:p-5 sm:pb-0")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-title font-semibold">{title}</h3>
          {actions}
        </div>
        {caption && (
          <p className="mt-1 max-w-[70ch] text-caption text-graphite">
            {caption}
          </p>
        )}
      </figcaption>
      <div className={cn("mt-4", bleed && "mt-3")}>{children}</div>
    </figure>
  );
}

/** What a chart shows before there is anything to show. */
export function EmptyPlot({
  height = 220,
  children,
}: {
  height?: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center rounded-control border border-dashed border-grid px-6 text-center text-caption text-graphite"
    >
      <p className="max-w-[46ch]">{children}</p>
    </div>
  );
}

/** A key. Present whenever two or more series share a plot. */
export function Legend({
  items,
  className,
}: {
  items: Array<{ label: string; color: string; shape?: "line" | "dot" | "ring" }>;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-graphite",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              "inline-block shrink-0",
              item.shape === "line"
                ? "h-[2px] w-4 rounded-full"
                : "h-2.5 w-2.5 rounded-full",
            )}
            style={
              item.shape === "ring"
                ? {
                    border: `2px solid ${item.color}`,
                    backgroundColor: "transparent",
                  }
                : { backgroundColor: item.color }
            }
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** The tooltip body, styled once. */
export function TooltipCard({
  title,
  rows,
  note,
}: {
  title: string;
  rows: Array<{ label: string; value: string; color?: string }>;
  note?: string;
}) {
  return (
    <div className="pointer-events-none rounded-control border border-grid bg-surface px-3 py-2 shadow-ambient">
      <p className="font-mono text-micro uppercase tracking-wider text-graphite">
        {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center gap-2 text-caption text-ink"
          >
            {row.color && (
              <span
                aria-hidden
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span className="text-graphite">{row.label}</span>
            <span className="ml-auto font-mono font-medium">{row.value}</span>
          </li>
        ))}
      </ul>
      {note && <p className="mt-1.5 text-micro text-graphite">{note}</p>}
    </div>
  );
}

/** Axis + grid defaults, applied by spreading into a Recharts chart. */
export function useAxisProps(tokens: ChartTokens) {
  const tick = {
    fill: tokens.graphite,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  };
  return {
    grid: (
      <CartesianGrid
        stroke={tokens.grid}
        strokeWidth={1}
        vertical={false}
      />
    ),
    xAxis: {
      tick,
      tickLine: false,
      axisLine: { stroke: tokens.grid },
      stroke: tokens.grid,
    },
    yAxis: {
      tick,
      tickLine: false,
      axisLine: false,
      width: 40,
    },
    tooltipCursor: { stroke: tokens.graphite, strokeWidth: 1, strokeOpacity: 0.4 },
  };
}

/**
 * True only after the first client render.
 *
 * Recharts mints clip-path ids per render, so a server-rendered chart and
 * its client hydration disagree on those ids and React reports a mismatch.
 * Charts are also useless without layout measurement, so nothing is lost
 * by drawing them client-side only — the reserved box keeps the page from
 * reflowing when they arrive.
 */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Responsive plot frame with the shared axis defaults pre-wired. */
export function Plot({
  height,
  children,
  className,
}: {
  height: number;
  children: ReactNode;
  className?: string;
}) {
  const mounted = useMounted();
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  );
}

/**
 * Drop-in ResponsiveContainer that waits for mount, so any chart —
 * including the ones written before this layer existed — stops emitting a
 * hydration mismatch from Recharts' per-render clip-path ids.
 */
export function SafeResponsiveContainer({
  width = "100%",
  height,
  children,
}: {
  width?: number | string;
  height: number | string;
  children: ReactNode;
}) {
  const mounted = useMounted();
  return (
    <div style={{ width, height }}>
      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  );
}

/** Render children only once mounted, reserving their box meanwhile. */
export function ClientOnly({
  height,
  children,
  className,
}: {
  height: number;
  children: ReactNode;
  className?: string;
}) {
  const mounted = useMounted();
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {mounted ? children : null}
    </div>
  );
}

export { CartesianGrid, Tooltip, XAxis, YAxis, useChartTokens };
export type { ChartTokens };
