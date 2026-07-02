import { pick, randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

/** Build n from its prime factorization so the factor count is exact. */
export const factorCounts: PatternGenerator = (rng) => {
  const primes = [2, 3, 5, 7];
  const primeCount = randInt(rng, 2, 3);
  const chosen: number[] = [];
  while (chosen.length < primeCount) {
    const p = pick(rng, primes);
    if (!chosen.includes(p)) chosen.push(p);
  }
  chosen.sort((a, b) => a - b);

  let n = 1;
  let factorCount = 1;
  let exponentSum = 0;
  for (const p of chosen) {
    const maxExp = p === 2 ? 4 : p === 3 ? 3 : 2;
    let e = randInt(rng, 1, maxExp);
    while (n * p ** e > 1500) e--;
    if (e < 1) e = 1;
    n *= p ** e;
    factorCount *= e + 1;
    exponentSum += e;
  }

  const rating =
    1100 +
    (primeCount === 3 ? 150 : 0) +
    (exponentSum > 4 ? 100 : 0) +
    randInt(rng, 0, 50);

  return {
    prompt: `How many positive factors does $${n}$ have?`,
    answer: String(factorCount),
    difficultyRating: Math.min(rating, 1600),
  };
};
