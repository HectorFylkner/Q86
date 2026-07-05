import assert from "node:assert/strict";
import { test } from "node:test";
import { ELO_K, ELO_START, expectedScore, nextRating } from "../lib/elo.ts";

test("even match expects 0.5 and moves ±K/2", () => {
  assert.equal(expectedScore(ELO_START, ELO_START), 0.5);
  assert.equal(nextRating(ELO_START, ELO_START, true), ELO_START + ELO_K / 2);
  assert.equal(nextRating(ELO_START, ELO_START, false), ELO_START - ELO_K / 2);
});

test("beating a harder item pays more than beating an easier one", () => {
  const vsHarder = nextRating(1200, 1400, true) - 1200;
  const vsEasier = nextRating(1200, 1000, true) - 1200;
  assert.ok(vsHarder > vsEasier);
  assert.ok(vsHarder > 0 && vsEasier > 0);
});

test("expected scores of both sides sum to 1", () => {
  const a = expectedScore(1300, 1100);
  const b = expectedScore(1100, 1300);
  assert.ok(Math.abs(a + b - 1) < 1e-12);
});
