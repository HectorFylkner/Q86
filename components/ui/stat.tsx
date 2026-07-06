import { cn } from "@/lib/utils";

export type StatTone = "red" | "amber" | "blue";

export const STAT_TONE_CLASSES: Record<StatTone, string> = {
  red: "text-redpen",
  amber: "text-amber",
  blue: "text-ballpoint",
};

/** Bare label-over-value stat, used inline in result footers. */
export function Stat({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: string;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs text-graphite">{label}</div>
      <div
        className={cn(
          "font-mono text-2xl font-medium",
          tone && STAT_TONE_CLASSES[tone],
        )}
      >
        {value}
      </div>
    </div>
  );
}

/** Card-wrapped stat tile. The value line comes in as children so
 *  callers can pass a plain string or an <Odometer>. */
export function StatTile({
  label,
  tone,
  className,
  children,
}: {
  label: string;
  tone?: StatTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-grid bg-surface p-3 shadow-ambient",
        className,
      )}
    >
      <div className="text-[11px] leading-tight text-graphite">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-xl font-medium",
          tone && STAT_TONE_CLASSES[tone],
        )}
      >
        {children}
      </div>
    </div>
  );
}
