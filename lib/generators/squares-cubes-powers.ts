import { randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

/** Squares to 25², powers of 2 to 2¹², powers of 3 to 3⁷. */
export const squaresCubesPowers: PatternGenerator = (rng) => {
  const form = randInt(rng, 0, 3);

  if (form === 0) {
    const n = randInt(rng, 11, 25);
    return {
      prompt: `$${n}^2 = {?}$`,
      answer: String(n * n),
      difficultyRating:
        (n <= 15 ? 1050 : n <= 20 ? 1180 : 1300) + randInt(rng, 0, 50),
    };
  }
  if (form === 1) {
    const n = randInt(rng, 13, 25);
    return {
      prompt: `$\\sqrt{${n * n}} = {?}$`,
      answer: String(n),
      difficultyRating: (n <= 18 ? 1200 : 1350) + randInt(rng, 0, 50),
    };
  }
  if (form === 2) {
    const k = randInt(rng, 7, 12);
    return {
      prompt: `$2^{${k}} = {?}$`,
      answer: String(2 ** k),
      difficultyRating: (k <= 9 ? 1100 : 1250) + randInt(rng, 0, 50),
    };
  }
  const k = randInt(rng, 4, 7);
  return {
    prompt: `$3^{${k}} = {?}$`,
    answer: String(3 ** k),
    difficultyRating: (k <= 5 ? 1150 : 1350) + randInt(rng, 0, 50),
  };
};
