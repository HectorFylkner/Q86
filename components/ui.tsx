import { Odometer } from "@/components/odometer";
import { cn } from "@/lib/utils";

/**
 * The shared control vocabulary. Every ballpoint button in the app was
 * the same class string copy-pasted with drift; this is the single
 * source. `button()` returns the class string so callers keep their own
 * element (<button>, <Link>, <a>) — the primitive is the ink, not the
 * tag.
 */
type ButtonVariant = "primary" | "outline" | "quiet";
type ButtonSize = "md" | "sm";

const VARIANTS: Record<ButtonVariant, string> = {
  // Dark mode swaps the white label for paper-dark via globals.css
  // (.bg-ballpoint.text-white).
  primary:
    "bg-ballpoint font-medium text-white transition-colors hover:bg-ballpoint/90",
  outline:
    "border border-ballpoint font-medium text-ballpoint transition-colors hover:bg-ballpoint/5",
  quiet:
    "border border-grid bg-surface transition-colors hover:border-graphite/50",
};

const SIZES: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-4 py-1.5 text-sm",
};

export function button(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
): string {
  return cn("rounded-control", VARIANTS[variant], SIZES[size]);
}

/** Small bordered tag: taxonomy chips, badges. */
export function Chip({
  tone,
  className,
  children,
}: {
  tone?: "red" | "blue";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-control border px-1.5 py-0.5 text-[11px]",
        tone === "red" && "border-redpen/50 text-redpen",
        tone === "blue" && "border-ballpoint/50 text-ballpoint",
        tone == null && "border-grid bg-surface",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Carded stat with rolling numerals — the marking summary's and the
 *  pattern trainer's tiles, unified. */
export function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red" | "amber" | "blue";
}) {
  return (
    <div className="rounded-card border border-grid bg-surface p-3 shadow-ambient">
      <div className="text-[11px] leading-tight text-graphite">{label}</div>
      <Odometer
        text={value}
        className={cn(
          "mt-1 font-mono text-xl font-medium",
          tone === "red" && "text-redpen",
          tone === "amber" && "text-amber",
          tone === "blue" && "text-ballpoint",
        )}
      />
    </div>
  );
}
