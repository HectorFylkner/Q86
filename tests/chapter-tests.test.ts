import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RECERT_AFTER_DAYS,
  TIER_BAR,
  TIER_BLENDS,
  TIER_SIZE,
} from "../lib/chapter-test-config.ts";
import { recertReason } from "../lib/chapter-tests.ts";

const DAY = 86_400_000;
const NOW = 1_750_000_000_000;

test("tier blends each fill a full test", () => {
  for (const blend of Object.values(TIER_BLENDS)) {
    assert.equal(
      blend.reduce((s, [, n]) => s + n, 0),
      TIER_SIZE,
    );
  }
  // The 85% bar on 7 questions means exactly 6 to pass.
  assert.equal(Math.ceil(TIER_SIZE * TIER_BAR), 6);
});

test("recertReason: unpassed chapters never ask for re-certification", () => {
  assert.equal(
    recertReason({ passed: false, latestPassAt: null }, null, NOW),
    null,
  );
});

test("recertReason: a fresh pass with healthy drills is quiet", () => {
  assert.equal(
    recertReason(
      { passed: true, latestPassAt: NOW - 3 * DAY },
      { correct: 9, total: 10 },
      NOW,
    ),
    null,
  );
});

test("recertReason: slipping drills outrank staleness", () => {
  assert.equal(
    recertReason(
      { passed: true, latestPassAt: NOW - (RECERT_AFTER_DAYS + 5) * DAY },
      { correct: 4, total: 10 },
      NOW,
    ),
    "slipping",
  );
});

test("recertReason: an old pass goes stale", () => {
  assert.equal(
    recertReason(
      { passed: true, latestPassAt: NOW - (RECERT_AFTER_DAYS + 1) * DAY },
      { correct: 9, total: 10 },
      NOW,
    ),
    "stale",
  );
});

test("recertReason: thin drill data cannot flag slipping", () => {
  assert.equal(
    recertReason(
      { passed: true, latestPassAt: NOW - 2 * DAY },
      { correct: 1, total: 5 },
      NOW,
    ),
    null,
  );
});
