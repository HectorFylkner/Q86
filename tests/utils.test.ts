import assert from "node:assert/strict";
import { test } from "node:test";
import { clamp, cn, formatSeconds, percent } from "../lib/utils.ts";

test("formatSeconds renders m:ss, clamped at zero, no hour rollover", () => {
  assert.equal(formatSeconds(137), "2:17");
  assert.equal(formatSeconds(3661), "61:01");
  assert.equal(formatSeconds(-5), "0:00");
  assert.equal(formatSeconds(59.6), "1:00");
});

test("percent guards the zero denominator", () => {
  assert.equal(percent(0, 0), 0);
  assert.equal(percent(2, 3), 67);
});

test("clamp and cn behave", () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(cn("a", false, null, "b", undefined), "a b");
});
