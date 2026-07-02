import { pick, randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

function withCommas(n: number): string {
  return n.toLocaleString("en-US").replaceAll(",", "{,}");
}

export const divisibilityRules: PatternGenerator = (rng) => {
  if (rng() < 0.6) {
    // Yes/no snap judgment.
    const d = pick(rng, [3, 4, 6, 8, 9, 11] as const);
    const n = randInt(rng, 1000, 99999);
    const rating =
      1050 +
      (d === 8 || d === 11 ? 150 : d === 6 || d === 4 ? 50 : 0) +
      randInt(rng, 0, 60);
    return {
      prompt: `Is $${withCommas(n)}$ divisible by $${d}$?`,
      answer: n % d === 0 ? "Yes" : "No",
      options: ["Yes", "No"],
      difficultyRating: rating,
    };
  }
  // Find the smallest digit making the number divisible by 3 or 9.
  const d = pick(rng, [3, 9] as const);
  const prefix = randInt(rng, 10, 99);
  const suffix = randInt(rng, 10, 99);
  let answer = -1;
  for (let digit = 0; digit <= 9; digit++) {
    const n = Number(`${prefix}${digit}${suffix}`);
    if (n % d === 0) {
      answer = digit;
      break;
    }
  }
  return {
    prompt: `What is the smallest digit $d$ for which $${prefix}\\,d\\,${suffix}$ (a five-digit number) is divisible by $${d === 3 ? 3 : 9}$?`,
    answer: String(answer),
    difficultyRating: 1230 + randInt(rng, 0, 70),
  };
};
