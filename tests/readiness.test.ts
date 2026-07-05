import assert from "node:assert/strict";
import { test } from "node:test";
import { keyFromDayIndex } from "../lib/local-day.ts";
import { readinessRead } from "../lib/readiness.ts";
import type { WeeklyDiscipline } from "../lib/discipline.ts";
import type { ErrorWeek } from "../lib/forensics.ts";
import type { EditWeek, PacingWeek } from "../lib/longitudinal.ts";
import { ERROR_TYPES } from "../lib/taxonomy.ts";

const key = (i: number) => keyFromDayIndex(20_000 - (7 - i) * 7 - 6);

function disciplineWeek(i: number, sunkCosts: number): WeeklyDiscipline {
  return {
    weekStartKey: key(i),
    timedAnswered: 21,
    sunkCosts,
    secondsDonated: sunkCosts * 60,
    decideCalls: 0,
    decideAligned: 0,
  };
}

function errorWeek(i: number, calcErrors: number): ErrorWeek {
  const counts = {} as ErrorWeek["counts"];
  for (const et of ERROR_TYPES) counts[et] = 0;
  counts.calculation_error = calcErrors;
  return { weekStartKey: key(i), attempts: 50, classified: calcErrors, counts };
}

function pacingWeek(i: number, withinBench: number, total: number): PacingWeek {
  return {
    weekStartKey: key(i),
    answered: total,
    sinks: 0,
    rushedWrong: 0,
    benchRatioAvg: 1,
    d45: { withinBench, total },
  };
}

function editWeek(i: number, net: number, edits = Math.abs(net)): EditWeek {
  return { weekStartKey: key(i), edits, net };
}

const eight = <T,>(f: (i: number) => T) =>
  Array.from({ length: 8 }, (_, i) => f(i));

test("readinessRead anchors to the latest official score", () => {
  const read = readinessRead({
    series: [
      { date: "2026-05-01", score: 82 },
      { date: "2026-06-01", score: 84 },
      { date: "2026-06-20", score: null },
    ],
    disciplineWeeks: eight((i) => disciplineWeek(i, 0)),
    errorWeeks: eight((i) => errorWeek(i, 0)),
    pacingWeeks: eight((i) => pacingWeek(i, 8, 10)),
    editWeeks: eight((i) => editWeek(i, 0, 0)),
  });
  assert.equal(read.anchor.score, 84);
  assert.equal(read.anchor.date, "2026-06-01");
  assert.equal(read.leaks.length, 4);
});

test("rising sunk costs and negative edit net go red", () => {
  const read = readinessRead({
    series: [],
    // 0 in the first four weeks, 3 in the last four.
    disciplineWeeks: eight((i) => disciplineWeek(i, i >= 4 ? 1 : 0)),
    errorWeeks: eight((i) => errorWeek(i, i >= 4 ? 4 : 1)),
    pacingWeeks: eight((i) => pacingWeek(i, 2, 10)),
    editWeeks: eight((i) => editWeek(i, i >= 4 ? -1 : 0)),
  });
  const byKey = new Map(read.leaks.map((l) => [l.key, l]));
  assert.equal(byKey.get("sunk_costs")?.severity, "red");
  assert.equal(byKey.get("careless")?.severity, "red");
  assert.equal(byKey.get("edit_net")?.severity, "red");
  assert.equal(byKey.get("d45")?.severity, "red"); // 20% within bench
});

test("clean four weeks read ok, with improvement acknowledged", () => {
  const read = readinessRead({
    series: [{ date: "2026-06-01", score: 84 }],
    disciplineWeeks: eight((i) => disciplineWeek(i, i === 0 ? 2 : 0)),
    errorWeeks: eight((i) => errorWeek(i, 0)),
    pacingWeeks: eight((i) => pacingWeek(i, 7, 10)),
    editWeeks: eight((i) => editWeek(i, i >= 4 ? 1 : 0)),
  });
  const byKey = new Map(read.leaks.map((l) => [l.key, l]));
  assert.equal(byKey.get("sunk_costs")?.severity, "ok");
  assert.ok(byKey.get("sunk_costs")?.detail.includes("was 2"));
  assert.equal(byKey.get("careless")?.severity, "ok");
  assert.equal(byKey.get("edit_net")?.severity, "ok");
  assert.equal(byKey.get("d45")?.severity, "ok");
});

test("thin hard-question data reads amber, not confident", () => {
  const read = readinessRead({
    series: [],
    disciplineWeeks: eight((i) => disciplineWeek(i, 0)),
    errorWeeks: eight((i) => errorWeek(i, 0)),
    pacingWeeks: eight((i) => pacingWeek(i, 1, 1)), // 4 total < 6 minimum
    editWeeks: eight((i) => editWeek(i, 0, 0)),
  });
  const d45 = read.leaks.find((l) => l.key === "d45");
  assert.equal(d45?.severity, "amber");
  assert.ok(d45?.detail.includes("Not enough"));
});
