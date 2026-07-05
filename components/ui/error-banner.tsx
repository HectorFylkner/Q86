import { cn } from "@/lib/utils";

/**
 * The one error voice: red-pen margin note on the paper, never a bare
 * red span. Block by default; compact for inline status rows.
 */
export function ErrorBanner({
  compact = false,
  className,
  children,
}: {
  /** Fits inside a button row instead of spanning the column. */
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-control border border-redpen/40 bg-redpen/5 text-sm text-redpen",
        compact ? "inline-block px-2.5 py-1" : "px-3 py-2",
        className,
      )}
    >
      {children}
    </p>
  );
}
