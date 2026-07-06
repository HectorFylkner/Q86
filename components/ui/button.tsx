import { cn } from "@/lib/utils";

export type ButtonVariant = "ballpoint" | "outline" | "ghost" | "redpen";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ballpoint:
    "bg-ballpoint font-medium text-on-ballpoint hover:bg-ballpoint/90",
  outline: "border border-grid bg-surface hover:border-graphite/50",
  ghost: "text-graphite hover:text-ink",
  redpen:
    "border border-redpen/50 font-medium text-redpen hover:bg-redpen/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

/** The composed class string, for styling a Link or <a> as a button. */
export function buttonClasses(
  variant: ButtonVariant = "ballpoint",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control transition-colors disabled:cursor-not-allowed disabled:opacity-40",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Keyboard legend rendered inside the button (e.g. "↵", "N"). */
  keyHint?: string;
};

export function Button({
  variant = "ballpoint",
  size = "md",
  keyHint,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {children}
      {keyHint && (
        <span className="font-mono text-[10px] opacity-70">{keyHint}</span>
      )}
    </button>
  );
}
