import { randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

function trailingZeros(n: number): number {
  let zeros = 0;
  for (let p = 5; p <= n; p *= 5) zeros += Math.floor(n / p);
  return zeros;
}

export const trailingZerosFactorials: PatternGenerator = (rng) => {
  const n = randInt(rng, 10, 130);
  const rating =
    1050 + (n >= 25 ? 100 : 0) + (n >= 50 ? 100 : 0) + (n >= 100 ? 100 : 0);
  return {
    prompt: `How many zeros are at the end of $${n}!$?`,
    answer: String(trailingZeros(n)),
    difficultyRating: rating + randInt(rng, 0, 50),
  };
};
