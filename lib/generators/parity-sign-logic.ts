import { pick, randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

type ParityCase = { text: string; f: (n: number, m: number) => number };
type SignCase = { text: string; f: (x: number, y: number) => number };

// n odd, m even. Evaluated over samples; inconsistent results → "cannot".
const PARITY_CASES: ParityCase[] = [
  { text: "n + m", f: (n, m) => n + m },
  { text: "n \\cdot m", f: (n, m) => n * m },
  { text: "n^2 + m", f: (n, m) => n * n + m },
  { text: "n(n + 1)", f: (n) => n * (n + 1) },
  { text: "n \\cdot m + n", f: (n, m) => n * m + n },
  { text: "(n + m)^2", f: (n, m) => (n + m) ** 2 },
  { text: "n^2 + n + 1", f: (n) => n * n + n + 1 },
  { text: "\\frac{m}{2}", f: (_n, m) => m / 2 },
  { text: "\\frac{n + 1}{2}", f: (n) => (n + 1) / 2 },
  { text: "m^2 - n", f: (n, m) => m * m - n },
];

// x < 0 < y.
const SIGN_CASES: SignCase[] = [
  { text: "x \\cdot y", f: (x, y) => x * y },
  { text: "x^2 y", f: (x, y) => x * x * y },
  { text: "x - y", f: (x, y) => x - y },
  { text: "y - x", f: (x, y) => y - x },
  { text: "x^3 y^2", f: (x, y) => x ** 3 * y ** 2 },
  { text: "x + y", f: (x, y) => x + y },
  { text: "|x| \\cdot y", f: (x, y) => Math.abs(x) * y },
  { text: "\\frac{x}{y}", f: (x, y) => x / y },
  { text: "x^2 - y^2", f: (x, y) => x * x - y * y },
];

export const paritySignLogic: PatternGenerator = (rng) => {
  if (rng() < 0.5) {
    const c = pick(rng, PARITY_CASES);
    const samples: Array<[number, number]> = [
      [3, 2],
      [5, 4],
      [7, 8],
      [9, 6],
    ];
    const parities = new Set(
      samples.map(([n, m]) => (Math.abs(c.f(n, m)) % 2 === 0 ? "Even" : "Odd")),
    );
    const answer = parities.size === 1 ? [...parities][0] : "Cannot be determined";
    return {
      prompt: `$n$ is odd and $m$ is even. Is $${c.text}$ odd or even?`,
      answer,
      options: ["Odd", "Even", "Cannot be determined"],
      difficultyRating:
        (answer === "Cannot be determined" ? 1380 : 1200) + randInt(rng, 0, 80),
    };
  }
  const c = pick(rng, SIGN_CASES);
  const samples: Array<[number, number]> = [
    [-2, 0.5],
    [-0.5, 2],
    [-3, 1],
    [-1, 3],
  ];
  const signs = new Set(
    samples.map(([x, y]) => {
      const v = c.f(x, y);
      return v > 0 ? "Positive" : v < 0 ? "Negative" : "Zero";
    }),
  );
  const answer = signs.size === 1 ? [...signs][0] : "Cannot be determined";
  return {
    prompt: `$x < 0 < y$. What is the sign of $${c.text}$?`,
    answer,
    options: ["Positive", "Negative", "Zero", "Cannot be determined"],
    difficultyRating:
      (answer === "Cannot be determined" ? 1400 : 1220) + randInt(rng, 0, 80),
  };
};
