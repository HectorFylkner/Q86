import { pick, randInt } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

function modPow(base: number, exponent: number, mod: number): number {
  let result = 1 % mod;
  let b = base % mod;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return result;
}

/** CRT-free remainder work: power cycles and linear combinations. */
export const remainderArithmetic: PatternGenerator = (rng) => {
  if (rng() < 0.6) {
    const base = randInt(rng, 2, 9);
    const exponent = randInt(rng, 10, 99);
    const mod = pick(rng, [3, 5, 7, 9, 11, 13] as const);
    const rating =
      1280 +
      (mod > 7 ? 120 : 0) +
      (exponent > 50 ? 60 : 0) +
      randInt(rng, 0, 60);
    return {
      prompt: `What is the remainder when $${base}^{${exponent}}$ is divided by $${mod}$?`,
      answer: String(modPow(base, exponent, mod)),
      difficultyRating: Math.min(rating, 1600),
    };
  }
  const a = randInt(rng, 11, 99);
  const b = randInt(rng, 11, 99);
  const c = randInt(rng, 2, 30);
  const mod = randInt(rng, 3, 9);
  return {
    prompt: `What is the remainder when $${a} \\cdot ${b} + ${c}$ is divided by $${mod}$?`,
    answer: String((a * b + c) % mod),
    difficultyRating: 1150 + randInt(rng, 0, 80),
  };
};
