import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { ELO_K, ELO_START, expectedScore, nextRating } from "../lib/elo.ts";

/**
 * ELO drives which pattern categories the daily plan pulls. A silent
 * change here quietly retargets training for as long as it goes
 * unnoticed, which is why the properties — not just a sample value —
 * are pinned.
 */
describe("ELO", () => {
  test("equal ratings expect an even split", () => {
    assert.equal(expectedScore(1200, 1200), 0.5);
  });

  test("a 400-point edge is the classic 10:1 expectation", () => {
    assert.ok(Math.abs(expectedScore(1600, 1200) - 10 / 11) < 1e-12);
    assert.ok(Math.abs(expectedScore(1200, 1600) - 1 / 11) < 1e-12);
  });

  test("expectations of a pair sum to one", () => {
    for (const [a, b] of [
      [1200, 1200],
      [900, 1500],
      [1750, 1010],
    ]) {
      assert.ok(Math.abs(expectedScore(a, b) + expectedScore(b, a) - 1) < 1e-12);
    }
  });

  test("a win raises and a loss lowers, by at most K", () => {
    const win = nextRating(1200, 1250, true);
    const loss = nextRating(1200, 1250, false);
    assert.ok(win > 1200);
    assert.ok(loss < 1200);
    assert.ok(win - 1200 <= ELO_K);
    assert.ok(1200 - loss <= ELO_K);
  });

  test("an even matchup moves exactly K/2 either way", () => {
    assert.ok(Math.abs(nextRating(1200, 1200, true) - (1200 + ELO_K / 2)) < 1e-9);
    assert.ok(Math.abs(nextRating(1200, 1200, false) - (1200 - ELO_K / 2)) < 1e-9);
  });

  test("beating a much stronger item is worth more than beating a weaker one", () => {
    const upset = nextRating(1200, 1600, true) - 1200;
    const expected = nextRating(1200, 800, true) - 1200;
    assert.ok(upset > expected);
  });

  test("a win-then-loss pair drifts toward the item's rating, not back to the start", () => {
    // Below the item, splitting a pair is better than expected, so the
    // rating rises; above it, splitting is worse than expected, so it
    // falls. Both pull toward equilibrium — that is the whole mechanism.
    const fromBelow = nextRating(nextRating(1000, 1250, true), 1250, false);
    assert.ok(fromBelow > 1000, `expected a rise from below, got ${fromBelow}`);

    const fromAbove = nextRating(nextRating(1500, 1250, true), 1250, false);
    assert.ok(fromAbove < 1500, `expected a fall from above, got ${fromAbove}`);

    // And neither pair moves further than a single result could.
    assert.ok(Math.abs(fromBelow - 1000) < ELO_K);
    assert.ok(Math.abs(fromAbove - 1500) < ELO_K);
  });

  test("an unbeaten run has strictly shrinking steps and never runs away", () => {
    let r = ELO_START;
    let previousStep = Infinity;
    for (let i = 0; i < 500; i++) {
      const next = nextRating(r, 1250, true);
      const step = next - r;
      assert.ok(step > 0, "a win must always raise the rating");
      assert.ok(step < previousStep, `step ${step} did not shrink below ${previousStep}`);
      previousStep = step;
      r = next;
    }
    // 500 straight wins is a runaway scenario; the rating stays bounded
    // because each further win is worth less than the last.
    assert.ok(previousStep < 1, `final step was ${previousStep}`);
    assert.ok(r < 2400, `rating ran away to ${r}`);
  });
});
