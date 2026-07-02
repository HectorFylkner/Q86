import { pick, randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

/** The standard testing-numbers set. */
const TEST_SET = [-2, -1, -0.5, 0, 0.5, 1, 2];
const TEST_SET_TEX = "\\{-2,\\ -1,\\ -\\tfrac{1}{2},\\ 0,\\ \\tfrac{1}{2},\\ 1,\\ 2\\}";

type Predicate = { text: string; f: (x: number) => boolean };

const CONDITIONS: Predicate[] = [
  { text: "x^2 > x", f: (x) => x * x > x },
  { text: "x^3 < x", f: (x) => x ** 3 < x },
  { text: "|x| > 1", f: (x) => Math.abs(x) > 1 },
  { text: "x^2 < 1", f: (x) => x * x < 1 },
  { text: "x^3 = x", f: (x) => x ** 3 === x },
  { text: "\\frac{1}{x} > x", f: (x) => x !== 0 && 1 / x > x },
  { text: "|x| = -x", f: (x) => Math.abs(x) === -x },
  { text: "x^2 \\ge 2x", f: (x) => x * x >= 2 * x },
];

const CLAIMS: Predicate[] = [
  { text: "x > 0", f: (x) => x > 0 },
  { text: "x < 0", f: (x) => x < 0 },
  { text: "x > 1", f: (x) => x > 1 },
  { text: "x < 1", f: (x) => x < 1 },
  { text: "x \\ne 0", f: (x) => x !== 0 },
  { text: "|x| \\ge 1", f: (x) => Math.abs(x) >= 1 },
  { text: "x^2 \\ge 1", f: (x) => x * x >= 1 },
  { text: "x \\le 0", f: (x) => x <= 0 },
];

export const mustBeTrueSnap: PatternGenerator = (rng) => {
  for (let tries = 0; tries < 20; tries++) {
    const condition = pick(rng, CONDITIONS);
    const claim = pick(rng, CLAIMS);
    const satisfying = TEST_SET.filter(condition.f);
    if (satisfying.length === 0) continue;
    const mustBeTrue = satisfying.every(claim.f);
    return {
      prompt: `Judge against the test set $${TEST_SET_TEX}$:\n\nif $${condition.text}$, must $${claim.text}$ be true?`,
      answer: mustBeTrue ? "Must be true" : "Not necessarily true",
      options: ["Must be true", "Not necessarily true"],
      difficultyRating: 1330 + randInt(rng, 0, 120),
    };
  }
  // Unreachable fallback: every condition admits at least one member.
  return {
    prompt: `Judge against the test set $${TEST_SET_TEX}$:\n\nif $x^2 > x$, must $x > 1$ be true?`,
    answer: "Not necessarily true",
    options: ["Must be true", "Not necessarily true"],
    difficultyRating: 1350,
  };
};
