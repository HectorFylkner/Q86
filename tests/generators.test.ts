import { describe, expect, it } from "vitest";

import {
  PATTERN_CATEGORIES,
  PATTERN_CATEGORY_KEYS,
  PATTERN_CATEGORY_LABELS,
  generateFor,
  type PatternCategoryKey,
  type PatternGenerator,
  type PatternItem,
} from "../lib/generators/index.ts";
import { mulberry32, pick, randInt, shuffle } from "../lib/generators/rng.ts";

const SEEDS = Array.from({ length: 200 }, (_, i) => i * 7919);

// Independent re-derivations (no generator internals reused).
function unitsDigit(base: number, exp: number): number {
  let u = 1;
  for (let i = 0; i < exp; i++) u = (u * base) % 10;
  return u;
}

function slowModPow(base: number, exp: number, mod: number): number {
  let r = 1 % mod;
  for (let i = 0; i < exp; i++) r = (r * base) % mod;
  return r;
}

function countDivisors(n: number): number {
  let count = 0;
  for (let i = 1; i <= n; i++) if (n % i === 0) count++;
  return count;
}

function factorialTrailingZeros(n: number): number {
  let zeros = 0;
  for (let i = 5; i <= n; i += 5) {
    let x = i;
    while (x % 5 === 0) {
      zeros++;
      x /= 5;
    }
  }
  return zeros;
}

function parseFraction(s: string): number {
  const m = s.match(/\\frac\{(\d+)\}\{(\d+)\}/);
  if (!m) throw new Error(`no \\frac in: ${s}`);
  return Number(m[1]) / Number(m[2]);
}

// Percents render via toFixed(1), so the true value is within 0.05.
const PERCENT_TOLERANCE = 0.05 + 1e-9;

/**
 * Answer checkers keyed by category, parsing the values back out of the
 * prompt. Categories whose answers cannot be re-derived from the prompt
 * alone (parity_sign_logic, must_be_true_snap) are absent.
 */
const VERIFIERS: Partial<
  Record<PatternCategoryKey, (item: PatternItem) => void>
> = {
  units_digit_cycles(item) {
    const m = item.prompt.match(/units digit of \$(\d+)\^\{(\d+)\}\$/);
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    expect(Number(item.answer)).toBe(unitsDigit(Number(m[1]), Number(m[2])));
  },

  trailing_zeros_factorials(item) {
    const m = item.prompt.match(/end of \$(\d+)!\$/);
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    expect(Number(item.answer)).toBe(factorialTrailingZeros(Number(m[1])));
  },

  factor_counts(item) {
    const m = item.prompt.match(/factors does \$(\d+)\$ have/);
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    expect(Number(item.answer)).toBe(countDivisors(Number(m[1])));
  },

  remainder_arithmetic(item) {
    let m = item.prompt.match(
      /^What is the remainder when \$(\d+)\^\{(\d+)\}\$ is divided by \$(\d+)\$\?$/,
    );
    if (m) {
      expect(Number(item.answer)).toBe(
        slowModPow(Number(m[1]), Number(m[2]), Number(m[3])),
      );
      return;
    }
    m = item.prompt.match(
      /^What is the remainder when \$(\d+) \\cdot (\d+) \+ (\d+)\$ is divided by \$(\d+)\$\?$/,
    );
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    expect(Number(item.answer)).toBe(
      (Number(m[1]) * Number(m[2]) + Number(m[3])) % Number(m[4]),
    );
  },

  divisibility_rules(item) {
    let m = item.prompt.match(/^Is \$([\d{},]+)\$ divisible by \$(\d+)\$\?$/);
    if (m) {
      const n = Number(m[1].replaceAll("{,}", ""));
      expect(item.answer).toBe(n % Number(m[2]) === 0 ? "Yes" : "No");
      return;
    }
    m = item.prompt.match(
      /\$(\d+)\\,d\\,(\d+)\$ \(a five-digit number\) is divisible by \$(\d)\$/,
    );
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    const d = Number(m[3]);
    let smallest = -1;
    for (let digit = 0; digit <= 9; digit++) {
      if (Number(`${m[1]}${digit}${m[2]}`) % d === 0) {
        smallest = digit;
        break;
      }
    }
    expect(smallest).toBeGreaterThanOrEqual(0);
    expect(Number(item.answer)).toBe(smallest);
  },

  fraction_percent_pairs(item) {
    let m = item.prompt.match(
      /^Express \$\\frac\{(\d+)\}\{(\d+)\}\$ as a percent/,
    );
    if (m) {
      const value = (Number(m[1]) / Number(m[2])) * 100;
      expect(Math.abs(Number(item.answer) - value)).toBeLessThanOrEqual(
        PERCENT_TOLERANCE,
      );
      return;
    }
    m = item.prompt.match(
      /^\$\\frac\{(\d+)\}\{(\d+)\}\$ is approximately which percent\?$/,
    );
    if (m) {
      const value = (Number(m[1]) / Number(m[2])) * 100;
      expect(item.answer.endsWith("%")).toBe(true);
      expect(
        Math.abs(Number(item.answer.slice(0, -1)) - value),
      ).toBeLessThanOrEqual(PERCENT_TOLERANCE);
      return;
    }
    m = item.prompt.match(/^About \$([\d.]+)\\%\$ equals which fraction\?$/);
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    expect(
      Math.abs(parseFraction(item.answer) * 100 - Number(m[1])),
    ).toBeLessThanOrEqual(PERCENT_TOLERANCE);
  },

  squares_cubes_powers(item) {
    let m = item.prompt.match(/^\$(\d+)\^2 = \{\?\}\$$/);
    if (m) {
      expect(Number(item.answer)).toBe(Number(m[1]) ** 2);
      return;
    }
    m = item.prompt.match(/^\$\\sqrt\{(\d+)\} = \{\?\}\$$/);
    if (m) {
      expect(Number(item.answer) ** 2).toBe(Number(m[1]));
      return;
    }
    m = item.prompt.match(/^\$(\d+)\^\{(\d+)\} = \{\?\}\$$/);
    if (!m) throw new Error(`unrecognized prompt: ${item.prompt}`);
    expect(Number(item.answer)).toBe(Number(m[1]) ** Number(m[2]));
  },
};

const CATEGORIES: Array<{
  key: PatternCategoryKey;
  label: string;
  generate: PatternGenerator;
}> = [...PATTERN_CATEGORIES];

describe.each(CATEGORIES)("generator: $key", ({ key, generate }) => {
  it("produces an identical item for the same seed", () => {
    for (const seed of SEEDS.slice(0, 50)) {
      expect(generate(mulberry32(seed))).toEqual(generate(mulberry32(seed)));
    }
  });

  it("meets the PatternItem contract across many seeds", () => {
    for (const seed of SEEDS) {
      const item = generate(mulberry32(seed));
      expect(item.prompt.length).toBeGreaterThan(0);
      expect(typeof item.answer).toBe("string");
      expect(item.answer.length).toBeGreaterThan(0);
      expect(Number.isInteger(item.difficultyRating)).toBe(true);
      expect(item.difficultyRating).toBeGreaterThanOrEqual(1000);
      expect(item.difficultyRating).toBeLessThanOrEqual(1600);
      if (item.options) {
        expect(item.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(item.options).size).toBe(item.options.length);
        const idx = item.options.indexOf(item.answer);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(item.options.length);
      }
    }
  });

  it("varies across seeds", () => {
    const prompts = new Set(
      SEEDS.slice(0, 100).map((seed) => generate(mulberry32(seed)).prompt),
    );
    expect(prompts.size).toBeGreaterThan(1);
  });

  const verify = VERIFIERS[key];
  if (verify) {
    it("computes the correct answer", () => {
      for (const seed of SEEDS) verify(generate(mulberry32(seed)));
    });
  }
});

describe("generateFor", () => {
  it("dispatches deterministically for every key", () => {
    for (const key of PATTERN_CATEGORY_KEYS) {
      expect(generateFor(key, mulberry32(7))).toEqual(
        generateFor(key, mulberry32(7)),
      );
    }
  });

  it("throws for an unknown key", () => {
    expect(() => generateFor("nope" as PatternCategoryKey, mulberry32(1))).toThrow(
      /Unknown pattern category/,
    );
  });
});

describe("category registry", () => {
  it("has unique keys and a matching labels map", () => {
    expect(new Set(PATTERN_CATEGORY_KEYS).size).toBe(PATTERN_CATEGORIES.length);
    for (const c of PATTERN_CATEGORIES) {
      expect(PATTERN_CATEGORY_LABELS[c.key]).toBe(c.label);
    }
  });
});

describe("mulberry32", () => {
  it("yields the same sequence for the same seed", () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it("yields different sequences for different seeds", () => {
    const a = Array.from({ length: 10 }, mulberry32(1));
    const b = Array.from({ length: 10 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });

  it("stays in [0, 1) for varied seeds", () => {
    for (const seed of [0, 1, 42, 2 ** 31, -5]) {
      const rng = mulberry32(seed);
      for (let i = 0; i < 1000; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });
});

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const original = [...input];
    const out = shuffle(input, mulberry32(9));
    expect(input).toEqual(original);
    expect(out).not.toBe(input);
    expect([...out].sort((a, b) => a - b)).toEqual(original);
  });

  it("is deterministic per seed", () => {
    const items = ["a", "b", "c", "d", "e"];
    expect(shuffle(items, mulberry32(4))).toEqual(shuffle(items, mulberry32(4)));
  });

  it("handles empty and single-element arrays", () => {
    expect(shuffle([], mulberry32(1))).toEqual([]);
    expect(shuffle([7], mulberry32(1))).toEqual([7]);
  });
});

describe("randInt", () => {
  it("stays within inclusive bounds and reaches both endpoints", () => {
    const rng = mulberry32(11);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const v = randInt(rng, 3, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([3, 4, 5, 6]));
  });

  it("collapses to min when min === max", () => {
    const rng = mulberry32(2);
    for (let i = 0; i < 20; i++) expect(randInt(rng, 5, 5)).toBe(5);
  });
});

describe("pick", () => {
  it("returns an element of the array", () => {
    const rng = mulberry32(3);
    const items = ["x", "y", "z"];
    for (let i = 0; i < 100; i++) expect(items).toContain(pick(rng, items));
  });
});
