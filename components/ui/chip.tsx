import { cn } from "@/lib/utils";

export type ChipTone = "red" | "blue" | "amber";

const TONE_CLASSES: Record<ChipTone, string> = {
  red: "border-redpen/50 text-redpen",
  blue: "border-ballpoint/50 text-ballpoint",
  amber: "border-amber/50 text-amber",
};

export function Chip({
  tone,
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-control border px-1.5 py-0.5 text-[11px]",
        tone ? TONE_CLASSES[tone] : "border-grid bg-surface",
        className,
      )}
    >
      {children}
    </span>
  );
}
