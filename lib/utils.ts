import { twMerge } from "tailwind-merge";

/** Joins class fragments and resolves Tailwind conflicts (later wins),
 *  so callers can override primitive defaults without !important. */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return twMerge(parts.filter(Boolean).join(" "));
}

/** 137 → "2:17"; 3661 → "61:01" (minutes never roll into hours). */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** 137.4 → "2:17.4" for pattern-trainer style precision. */
export function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export const CHOICE_LETTERS = ["A", "B", "C", "D", "E"] as const;
