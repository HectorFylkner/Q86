import assert from "node:assert/strict";
import { test } from "node:test";
import { TIME_BENCH } from "../lib/pacing.ts";
import {
  budgetFor,
  clampDifficulty,
  RAMP_MIN_ATTEMPTS,
  RAMP_WINDOW,
  rampStage,
  softCapSeconds,
  type RampAttempt,
} from "../lib/ramp.ts";

const hit = (timeSeconds: number): RampAttempt => ({
  correct: true,
  timeSeconds,
});
const miss = (timeSeconds: number): RampAttempt => ({
  correct: false,
  timeSeconds,
});
const luckyHit = (timeSeconds: number): RampAttempt => ({
  correct: true,
  timeSeconds,
  confidence: "guess",
});

test("soft caps are bench × 1.4 rounded to 5s", () => {
  assert.equal(softCapSeconds(3), 175); // 125 × 1.4
  assert.equal(softCapSeconds(5), 240); // 170 × 1.4 = 238 → 240
  assert.equal(softCapSeconds(1), 120); // 85 × 1.4 = 119 → 120
});

test("too few attempts → build, whatever their quality", () => {
  assert.equal(rampStage([], 3), "build");
  assert.equal(
    rampStage(Array(RAMP_MIN_ATTEMPTS - 1).fill(hit(60)), 3),
    "build",
  );
});

test("accuracy below the bar keeps the clock away", () => {
  // 3/6 = 50% — accurate work first, no cap.
  const recent = [hit(60), hit(60), hit(60), miss(60), miss(60), miss(60)];
  assert.equal(rampStage(recent, 3), "build");
});

test("proven accuracy but slow corrects → soft cap", () => {
  // 5/5 correct, all far over the D3 soft cap (175s).
  const recent = Array(5).fill(hit(300));
  assert.equal(rampStage(recent, 3), "soft");
  assert.equal(budgetFor(recent, 3).budgetSeconds, softCapSeconds(3));
});

test("accuracy holding inside the soft cap → exam pace", () => {
  const recent = Array(5).fill(hit(100));
  assert.equal(rampStage(recent, 3), "exam");
  assert.equal(budgetFor(recent, 3).budgetSeconds, TIME_BENCH[3]);
});

test("a collapse in the rolling window loosens the clock again", () => {
  const strong = Array(8).fill(hit(100));
  assert.equal(rampStage(strong, 4), "exam");
  // Four fresh misses land at the front of the window.
  const collapsed = [miss(200), miss(200), miss(200), miss(200), ...strong];
  assert.equal(rampStage(collapsed, 4), "build");
});

test("only the newest RAMP_WINDOW attempts count", () => {
  // Window is all fast hits; ancient misses beyond it are ignored.
  const recent = [
    ...Array(RAMP_WINDOW).fill(hit(90)),
    ...Array(10).fill(miss(90)),
  ];
  assert.equal(rampStage(recent, 3), "exam");
});

test("guessed corrects are not pace evidence", () => {
  // Five fast 'corrects' — all guesses. The cell has proven nothing.
  assert.equal(rampStage(Array(5).fill(luckyHit(60)), 3), "build");
  // 4 solid fast + 1 lucky: 4/5 = 0.8 solid accuracy and paced → exam.
  assert.equal(
    rampStage([...Array(4).fill(hit(80)), luckyHit(60)], 3),
    "exam",
  );
});

test("build stage shows no budget at all", () => {
  const b = budgetFor([], 4);
  assert.equal(b.stage, "build");
  assert.equal(b.budgetSeconds, null);
  assert.equal(b.benchSeconds, TIME_BENCH[4]);
});

test("clampDifficulty guards out-of-range values", () => {
  assert.equal(clampDifficulty(0), 3);
  assert.equal(clampDifficulty(6), 3);
  assert.equal(clampDifficulty(5), 5);
});
