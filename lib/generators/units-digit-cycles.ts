import { randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

/** Units digits of b^k for k = 1, 2, 3, … */
const CYCLES: Record<number, number[]> = {
  2: [2, 4, 8, 6],
  3: [3, 9, 7, 1],
  4: [4, 6],
  5: [5],
  6: [6],
  7: [7, 9, 3, 1],
  8: [8, 4, 2, 6],
  9: [9, 1],
};

export const unitsDigitCycles: PatternGenerator = (rng) => {
  const bases = [2, 3, 4, 5, 6, 7, 8, 9];
  const base = bases[randInt(rng, 0, bases.length - 1)];
  const exponent = randInt(rng, 11, 99);
  const cycle = CYCLES[base];
  const answer = cycle[(exponent - 1) % cycle.length];

  const rating =
    cycle.length === 1
      ? 1000 + randInt(rng, 0, 50)
      : cycle.length === 2
        ? 1150 + randInt(rng, 0, 50)
        : 1300 + (exponent > 50 ? 60 : 0) + randInt(rng, 0, 60);

  return {
    prompt: `What is the units digit of $${base}^{${exponent}}$?`,
    answer: String(answer),
    difficultyRating: rating,
  };
};
