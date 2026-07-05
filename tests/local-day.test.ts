import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dayIndex,
  dayIndexFromKey,
  dayKey,
  isValidTimeZone,
  keyFromDayIndex,
  shortLabelFromKey,
} from "../lib/local-day.ts";

test("dayKey follows the zone's calendar, not the server's", () => {
  const instant = new Date("2026-01-01T00:30:00Z");
  assert.equal(dayKey(instant, "Europe/Stockholm"), "2026-01-01");
  assert.equal(dayKey(instant, "America/New_York"), "2025-12-31");
  assert.equal(dayKey(instant, "UTC"), "2026-01-01");
});

test("dayIndex/keyFromDayIndex round-trip", () => {
  const key = "2026-07-05";
  assert.equal(keyFromDayIndex(dayIndexFromKey(key)), key);
});

test("consecutive days differ by exactly 1 across a DST change", () => {
  // Europe DST starts 2026-03-29 (23-hour day).
  const before = dayIndex(new Date("2026-03-28T12:00:00Z"), "Europe/Stockholm");
  const after = dayIndex(new Date("2026-03-29T12:00:00Z"), "Europe/Stockholm");
  assert.equal(after - before, 1);
});

test("two instants share an index iff they share a local day", () => {
  const lateNight = new Date("2026-07-04T21:59:00Z"); // 23:59 in Stockholm
  const justAfter = new Date("2026-07-04T22:01:00Z"); // 00:01 next day
  const tz = "Europe/Stockholm";
  assert.equal(
    dayIndex(justAfter, tz) - dayIndex(lateNight, tz),
    1,
  );
  assert.equal(dayIndex(lateNight, "UTC"), dayIndex(justAfter, "UTC"));
});

test("shortLabelFromKey strips padding", () => {
  assert.equal(shortLabelFromKey("2026-07-05"), "7/5");
  assert.equal(shortLabelFromKey("2026-12-31"), "12/31");
});

test("isValidTimeZone accepts IANA names, rejects junk", () => {
  assert.equal(isValidTimeZone("Europe/Stockholm"), true);
  assert.equal(isValidTimeZone("UTC"), true);
  assert.equal(isValidTimeZone("Not/AZone"), false);
  assert.equal(isValidTimeZone(""), false);
});
