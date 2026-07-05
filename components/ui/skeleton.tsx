import { cn } from "@/lib/utils";

/**
 * Building blocks for route loading states. Every loading.tsx echoes its
 * real page's card layout with these, so a tab switch never blanks the
 * paper — the pencil sketch of the page appears, then the ink fills in.
 */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

/** Page wrapper: announces loading once, hides the sketch from readers. */
export function SkeletonPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-label="Loading" className={cn("space-y-4", className)}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

/** Echoes <SectionTabs>: short underlined labels above the title. */
export function SkeletonTabs({ count = 2 }: { count?: number }) {
  return (
    <div className="flex gap-5 border-b border-grid pb-2.5">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-3.5 w-24" />
      ))}
    </div>
  );
}

/** Echoes the page h1 (+ optional caption line beside it). */
export function SkeletonTitle({ caption = true }: { caption?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <Skeleton className="h-7 w-44" />
      {caption && <Skeleton className="h-3.5 w-64 max-w-full" />}
    </div>
  );
}

/** A surface card with a title line and a few body lines. */
export function SkeletonCard({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-3/4", "w-full", "w-5/6", "w-2/3", "w-1/2"];
  return (
    <div
      className={cn(
        "rounded-card border border-grid bg-surface p-4 shadow-ambient",
        className,
      )}
    >
      <Skeleton className="h-4 w-32" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={cn("h-3", widths[i % widths.length])} />
        ))}
      </div>
    </div>
  );
}

/** A chart-shaped card: title, subtitle, one tall block. */
export function SkeletonChartCard({ height = "h-64" }: { height?: string }) {
  return (
    <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-72 max-w-full" />
      <Skeleton className={cn("mt-3 w-full rounded-control", height)} />
    </div>
  );
}
