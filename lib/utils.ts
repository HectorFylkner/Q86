export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
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

/** 1 → "1st", 2 → "2nd", 11 → "11th", 61 → "61st". Percentiles read as
 *  ordinals on the official report, so they read as ordinals here. */
export function ordinal(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const tens = abs % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  switch (abs % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
