import { describe, expect, it } from "vitest";
import {
  TIME_BENCH,
  SINK_RATIO,
  RUSH_RATIO,
  pacingRead,
  type PacedItem,
} from "../lib/pacing.ts";
import { DIFFICULTIES, type Difficulty } from "../lib/taxonomy.ts";

function item(
  difficulty: Difficulty,
  timeSeconds: number,
  correct = true,
  index = 0,
): PacedItem {
  return { index, difficulty, timeSeconds, correct };
}

describe("TIME_BENCH", () => {
  it("has a positive benchmark for every difficulty", () => {
    expect(Object.keys(TIME_BENCH).map(Number).sort()).toEqual(
      [...DIFFICULTIES].sort(),
    );
    for (const d of DIFFICULTIES) {
      expect(TIME_BENCH[d]).toBeGreaterThan(0);
      expect(Number.isFinite(TIME_BENCH[d])).toBe(true);
    }
  });

  it("matches the documented per-difficulty values", () => {
    expect(TIME_BENCH).toEqual({ 1: 85, 2: 100, 3: 125, 4: 150, 5: 170 });
  });

  it("is strictly increasing with difficulty", () => {
    for (let i = 1; i < DIFFICULTIES.length; i++) {
      expect(TIME_BENCH[DIFFICULTIES[i]]).toBeGreaterThan(
        TIME_BENCH[DIFFICULTIES[i - 1]],
      );
    }
  });

  it("averages roughly the section budget of 45:00 for 21 questions", () => {
    const mean =
      DIFFICULTIES.reduce((s, d) => s + TIME_BENCH[d], 0) / DIFFICULTIES.length;
    const sectionAvg = (45 * 60) / 21;
    expect(Math.abs(mean - sectionAvg) / sectionAvg).toBeLessThan(0.05);
  });

  it("exposes the documented sink and rush ratios", () => {
    expect(SINK_RATIO).toBe(1.5);
    expect(RUSH_RATIO).toBe(0.5);
  });
});

describe("pacingRead byDifficulty", () => {
  it("returns empty reads for no items", () => {
    expect(pacingRead([])).toEqual({
      byDifficulty: [],
      sinks: [],
      rushedWrong: [],
    });
  });

  it("averages times per difficulty actually seen, with matching benchmark", () => {
    const read = pacingRead([
      item(2, 90),
      item(2, 110),
      item(4, 150, false),
    ]);
    expect(read.byDifficulty).toEqual([
      { difficulty: 2, n: 2, avgSeconds: 100, benchSeconds: TIME_BENCH[2] },
      { difficulty: 4, n: 1, avgSeconds: 150, benchSeconds: TIME_BENCH[4] },
    ]);
  });

  it("sorts rows by ascending difficulty regardless of input order", () => {
    const read = pacingRead([item(5, 170), item(1, 85), item(3, 125)]);
    expect(read.byDifficulty.map((r) => r.difficulty)).toEqual([1, 3, 5]);
  });
});

describe("pacingRead sinks", () => {
  it("classifies strictly above bench * SINK_RATIO at every difficulty", () => {
    for (const d of DIFFICULTIES) {
      const edge = TIME_BENCH[d] * SINK_RATIO;
      const at = pacingRead([item(d, edge)]);
      const under = pacingRead([item(d, edge - 0.001)]);
      const over = pacingRead([item(d, edge + 0.001)]);
      expect(at.sinks).toEqual([]);
      expect(under.sinks).toEqual([]);
      expect(over.sinks).toHaveLength(1);
    }
  });

  it("ignores correctness", () => {
    const t = TIME_BENCH[3] * SINK_RATIO + 1;
    expect(pacingRead([item(3, t, true)]).sinks).toHaveLength(1);
    expect(pacingRead([item(3, t, false)]).sinks).toHaveLength(1);
  });

  it("orders sinks worst first by time-over-benchmark ratio", () => {
    const items = [
      item(5, TIME_BENCH[5] * 2, true, 0),
      item(1, TIME_BENCH[1] * 4, true, 1),
      item(3, TIME_BENCH[3] * 3, true, 2),
    ];
    const read = pacingRead(items);
    expect(read.sinks.map((s) => s.index)).toEqual([1, 2, 0]);
  });
});

describe("pacingRead rushedWrong", () => {
  it("flags wrong answers strictly under bench * RUSH_RATIO at every difficulty", () => {
    for (const d of DIFFICULTIES) {
      const edge = TIME_BENCH[d] * RUSH_RATIO;
      const under = pacingRead([item(d, edge - 0.001, false)]);
      const at = pacingRead([item(d, edge, false)]);
      const over = pacingRead([item(d, edge + 0.001, false)]);
      expect(under.rushedWrong).toHaveLength(1);
      expect(at.rushedWrong).toEqual([]);
      expect(over.rushedWrong).toEqual([]);
    }
  });

  it("never flags correct answers, however fast", () => {
    const read = pacingRead([item(2, 1, true)]);
    expect(read.rushedWrong).toEqual([]);
  });
});

describe("pacingRead classification", () => {
  it("a wrong answer at exactly the benchmark lands in neither list", () => {
    const read = pacingRead([item(4, TIME_BENCH[4], false)]);
    expect(read.sinks).toEqual([]);
    expect(read.rushedWrong).toEqual([]);
    expect(read.byDifficulty).toHaveLength(1);
  });

  it("splits a mixed set into disjoint sinks and rushedWrong", () => {
    const items = [
      item(1, TIME_BENCH[1] * 2, false, 0), // sink
      item(2, TIME_BENCH[2] * 0.25, false, 1), // rushed wrong
      item(3, TIME_BENCH[3], true, 2), // neither
    ];
    const read = pacingRead(items);
    expect(read.sinks.map((s) => s.index)).toEqual([0]);
    expect(read.rushedWrong.map((r) => r.index)).toEqual([1]);
  });
});
