import { pick, randInt } from "./rng.ts";
import { shuffle } from "./rng.ts";
import type { PatternGenerator } from "./types.ts";

type Pair = {
  num: number;
  den: number;
  /** Display percent, one decimal where repeating. */
  percent: string;
  /** Exactly terminating → typed answer allowed. */
  exact: boolean;
  rating: number;
};

function buildPairs(): Pair[] {
  const pairs: Pair[] = [];
  const families: Array<[number, number[], number]> = [
    [6, [1, 5], 1200],
    [7, [1, 2, 3], 1400],
    [8, [1, 3, 5, 7], 1100],
    [9, [1, 2, 4, 5], 1250],
    [11, [1, 2, 3], 1400],
    [12, [1, 5, 7, 11], 1300],
  ];
  for (const [den, nums, rating] of families) {
    for (const num of nums) {
      const value = (num / den) * 100;
      const exact = den === 8;
      pairs.push({
        num,
        den,
        percent: exact
          ? String(Math.round(value * 10) / 10)
          : value.toFixed(1),
        exact,
        rating,
      });
    }
  }
  return pairs;
}

const PAIRS = buildPairs();

export const fractionPercentPairs: PatternGenerator = (rng) => {
  const pair = pick(rng, PAIRS);
  const rating = pair.rating + randInt(rng, 0, 60);

  if (pair.exact && rng() < 0.6) {
    // Terminating: typed numeric percent.
    return {
      prompt: `Express $\\frac{${pair.num}}{${pair.den}}$ as a percent. (Type the number only.)`,
      answer: pair.percent,
      difficultyRating: rating,
    };
  }

  if (rng() < 0.5) {
    // fraction → percent, 4 options from the same families.
    const distractors = shuffle(
      PAIRS.filter((p) => p.percent !== pair.percent),
      rng,
    )
      .slice(0, 3)
      .map((p) => `${p.percent}%`);
    return {
      prompt: `$\\frac{${pair.num}}{${pair.den}}$ is approximately which percent?`,
      answer: `${pair.percent}%`,
      options: shuffle([`${pair.percent}%`, ...distractors], rng),
      difficultyRating: rating,
    };
  }

  // percent → fraction, 4 options.
  const distractors = shuffle(
    PAIRS.filter((p) => p.percent !== pair.percent),
    rng,
  )
    .slice(0, 3)
    .map((p) => `$\\frac{${p.num}}{${p.den}}$`);
  return {
    prompt: `About $${pair.percent}\\%$ equals which fraction?`,
    answer: `$\\frac{${pair.num}}{${pair.den}}$`,
    options: shuffle([`$\\frac{${pair.num}}{${pair.den}}$`, ...distractors], rng),
    difficultyRating: rating + 50,
  };
};
