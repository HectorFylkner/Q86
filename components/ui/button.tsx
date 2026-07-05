import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The one button voice. Two sizes, five inks:
 *   primary       — ballpoint fill, the working CTA
 *   secondary     — quiet bordered surface
 *   accent        — ballpoint outline, for generative side actions
 *   danger        — red-pen fill; corrections only, never emphasis
 *   dangerOutline — red-pen outline; destructive side actions
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "dangerOutline";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ballpoint font-medium text-on-accent hover:bg-ballpoint/90",
  secondary: "border border-grid bg-surface hover:border-graphite/50",
  accent:
    "border border-ballpoint font-medium text-ballpoint hover:bg-ballpoint/5",
  danger: "bg-redpen font-medium text-on-accent hover:bg-redpen/90",
  dangerOutline:
    "border border-redpen/50 font-medium text-redpen hover:bg-redpen/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-control transition-colors duration-150",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  busy = false,
  className,
  disabled,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** In-flight state: keeps the button enabled-looking but waiting. */
  busy?: boolean;
}) {
  return (
    <button
      className={cn(
        buttonClasses(variant, size, className),
        disabled && !busy && "cursor-not-allowed opacity-50",
        busy && "cursor-wait opacity-60",
      )}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

/** 10px mono keyboard hint inside a button ("↵", "N", "B"). */
export function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-micro opacity-70" aria-hidden>
      {children}
    </span>
  );
}
