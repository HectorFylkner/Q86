import { cn } from "@/lib/utils";

/**
 * Static metadata chip — one radius, one size, ink chosen by meaning:
 * blue for pass/working ink, red strictly for corrections, amber for
 * warnings. Selection chips (pickers) are buttons, not Chips.
 */
export function Chip({
  tone = "neutral",
  mono = false,
  className,
  children,
}: {
  tone?: "neutral" | "blue" | "red" | "amber";
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-control border px-1.5 py-0.5 text-caption",
        mono && "font-mono",
        tone === "neutral" && "border-grid bg-surface",
        tone === "blue" && "border-ballpoint/50 text-ballpoint",
        tone === "red" && "border-redpen/50 text-redpen",
        tone === "amber" && "border-amber/50 text-amber",
        className,
      )}
    >
      {children}
    </span>
  );
}
