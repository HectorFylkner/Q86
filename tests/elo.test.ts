import { describe, expect, it } from "vitest";
import { ELO_K, ELO_START, expectedScore, nextRating } from "../lib/elo.ts";

const ratingPairs: Array<[number, number]> = [
  [1200, 1200],
  [1200, 1000],
  [1000, 1200],
  [1500, 800],
  [800, 1500],
  [1200, 1201],
  [2400, 1200],
  [0, 400],
];

describe("constants", () => {
  it("match the §F6 spec (start 1200, K = 24)", () => {
    expect(ELO_START).toBe(1200);
    expect(ELO_K).toBe(24);
  });
});

describe("expectedScore", () => {
  it("returns 0.5 for equal ratings", () => {
    for (const r of [0, 800, 1200, 2000]) {
      expect(expectedScore(r, r)).toBe(0.5);
    }
  });

  it("is symmetric: E(a,b) + E(b,a) = 1", () => {
    for (const [a, b] of ratingPairs) {
      expect(expectedScore(a, b) + expectedScore(b, a)).toBeCloseTo(1, 12);
    }
  });

  it("stays strictly within (0, 1)", () => {
    for (const [a, b] of ratingPairs) {
      const e = expectedScore(a, b);
      expect(e).toBeGreaterThan(0);
      expect(e).toBeLessThan(1);
    }
  });

  it("increases as the player's rating advantage grows", () => {
    const gaps = [-800, -400, -100, 0, 100, 400, 800];
    const scores = gaps.map((g) => expectedScore(1200 + g, 1200));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it("depends only on the rating difference", () => {
    expect(expectedScore(1300, 1100)).toBeCloseTo(expectedScore(700, 500), 12);
  });
});

describe("nextRating", () => {
  it("raises the rating on a correct answer", () => {
    for (const [player, item] of ratingPairs) {
      expect(nextRating(player, item, true)).toBeGreaterThan(player);
    }
  });

  it("lowers the rating on an incorrect answer", () => {
    for (const [player, item] of ratingPairs) {
      expect(nextRating(player, item, false)).toBeLessThan(player);
    }
  });

  it("changes the rating by strictly less than K", () => {
    for (const [player, item] of ratingPairs) {
      for (const correct of [true, false]) {
        const delta = Math.abs(nextRating(player, item, correct) - player);
        expect(delta).toBeLessThan(ELO_K);
        expect(delta).toBeGreaterThan(0);
      }
    }
  });

  it("moves equal ratings by exactly K/2", () => {
    expect(nextRating(ELO_START, ELO_START, true)).toBe(ELO_START + ELO_K / 2);
    expect(nextRating(ELO_START, ELO_START, false)).toBe(ELO_START - ELO_K / 2);
  });

  it("is zero-sum for opposite outcomes at mirrored ratings", () => {
    for (const [a, b] of ratingPairs) {
      const winnerGain = nextRating(a, b, true) - a;
      const loserLoss = nextRating(b, a, false) - b;
      expect(winnerGain + loserLoss).toBeCloseTo(0, 12);
    }
  });

  it("rewards upsets more than expected wins", () => {
    const underdogGain = nextRating(1000, 1400, true) - 1000;
    const favoriteGain = nextRating(1400, 1000, true) - 1400;
    expect(underdogGain).toBeGreaterThan(favoriteGain);
  });
});
