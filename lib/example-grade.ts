/**
 * Grading for worked-example answer commitments. Pure string logic —
 * shared by the server action (the stored verdict) and the card UI.
 *
 * Lesson answers are markdown ("**Answer: $\$195$**" arrives here as
 * "$\$195$", "$k = 20$", "C", "$\frac{17}{42}$", "4:12 p.m."), so
 * grading is best-effort: a commitment graded true/false got an
 * unambiguous match; null means "couldn't tell" and the card offers a
 * one-tap self-mark instead. Never guess — a wrong automatic verdict
 * is worse than asking.
 */

export type CommitMode =
  | { kind: "choices"; letters: string[] }
  | { kind: "ds" }
  | { kind: "numeric" };

/** How the answer commitment should be captured for a given example:
 *  letter taps when the stem lists A)–E) choices, the five canonical
 *  data-sufficiency taps when statements (1)/(2) are present, a free
 *  numeric line otherwise. */
export function detectCommitMode(question: string): CommitMode {
  const letters = [...question.matchAll(/^([A-E])\)\s/gm)].map((m) => m[1]);
  if (letters.length >= 3) return { kind: "choices", letters };
  if (/^\(1\)\s/m.test(question) && /^\(2\)\s/m.test(question)) {
    return { kind: "ds" };
  }
  return { kind: "numeric" };
}

/** Strip TeX down to comparable plain text: \frac{a}{b} → a/b, then
 *  commands, braces, dollars, thousands separators out. */
function normalize(text: string): string {
  return text
    .replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1/$2")
    .replace(/\{,\}/g, "")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Parse a committed value: plain number, a/b fraction, comma/percent/
 *  currency noise tolerated. */
function parseValue(raw: string): number | null {
  const s = raw.replace(/[,$%\s]/g, "");
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (frac) {
    const den = Number(frac[2]);
    return den === 0 ? null : Number(frac[1]) / den;
  }
  const n = Number(s);
  return Number.isFinite(n) && s !== "" ? n : null;
}

/** Every distinct numeric value present in a normalized answer,
 *  fractions evaluated. */
function answerValues(normalized: string): number[] {
  const values = new Set<number>();
  for (const m of normalized.matchAll(
    /-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?/g,
  )) {
    const v = parseValue(m[0]);
    if (v != null) values.add(v);
  }
  return [...values];
}

export function gradeCommitment(
  answerMd: string,
  committed: string,
): boolean | null {
  const answer = normalize(answerMd);
  const commit = committed.trim().toLowerCase();
  if (!answer || !commit) return null;

  // Letter commitments (choice taps): gradable only when the answer
  // itself is stated as a bare letter.
  if (/^[a-e]$/.test(commit)) {
    const bare = answer.replace(/[().\s]/g, "");
    return /^[a-e]$/.test(bare) ? bare === commit : null;
  }

  // Numeric: unambiguous only when the answer contains exactly one
  // distinct value. A committed decimal gets rounding tolerance so
  // "0.405" matches an exact 17/42.
  const committedValue = parseValue(commit);
  const values = answerValues(answer);
  if (committedValue != null && values.length === 1) {
    const tolerance = commit.includes(".")
      ? 0.005 * Math.max(1, Math.abs(values[0]))
      : 1e-9;
    return Math.abs(values[0] - committedValue) <= tolerance;
  }

  // Exact-text fallback for non-numeric answers ("4:12 p.m.").
  if (commit.length >= 2 && answer.includes(normalize(commit))) return true;

  return null;
}
