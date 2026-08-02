import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { interleave, longestRun, minPossibleRun } from "../lib/interleave.ts";

/**
 * The property that matters is not "the output is shuffled" — it is that
 * consecutive items come from different groups as often as the group
 * sizes allow. Blocked practice is what happens when that fails, and it
 * costs roughly thirty points of delayed retention.
 */
describe("interleaving the daily block", () => {
  test("nothing is lost, duplicated, or invented", () => {
    const groups = [
      [1, 2, 3],
      [4, 5],
      [6, 7, 8, 9],
    ];
    const out = interleave(groups);
    assert.deepEqual(
      [...out].sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  test("equal groups alternate perfectly", () => {
    const out = interleave([
      ["a", "a", "a"],
      ["b", "b", "b"],
      ["c", "c", "c"],
    ]);
    assert.equal(longestRun(out, (x) => x), 1);
  });

  test("a dominant group is spread, not dumped at the end", () => {
    // The old blocked selection would emit aaaaaaaa then b then c.
    const out = interleave([
      ["a", "a", "a", "a", "a", "a", "a", "a"],
      ["b"],
      ["c"],
    ]);
    assert.equal(out.length, 10);
    const run = longestRun(out, (x) => x);
    assert.ok(
      run <= minPossibleRun([8, 1, 1]) + 1,
      `run of ${run} exceeds what these sizes allow`,
    );
    // Specifically: the singletons land inside the block, not at the
    // front with a six-long run of "a" behind them, which is what plain
    // round-robin produced.
    assert.ok(out.indexOf("b") >= 2, "the singletons must sit inside");
    assert.ok(out.lastIndexOf("a") - out.indexOf("c") >= 2, "tail is mixed");
  });

  test("the achieved run never beats the theoretical floor", () => {
    const cases: number[][] = [
      [3, 3, 3],
      [5, 2, 1],
      [10, 1],
      [4, 4],
      [7, 3, 2, 1],
      [1, 1, 1, 1],
    ];
    for (const sizes of cases) {
      const groups = sizes.map((n, i) =>
        Array.from({ length: n }, () => String.fromCharCode(97 + i)),
      );
      const out = interleave(groups);
      const floor = minPossibleRun(sizes);
      const run = longestRun(out, (x) => x);
      assert.ok(
        run >= floor,
        `sizes ${sizes}: run ${run} is below the floor ${floor}, which is impossible`,
      );
      assert.ok(
        run <= floor + 1,
        `sizes ${sizes}: run ${run} is worse than the floor ${floor} allows`,
      );
    }
  });

  test("two groups of one each cannot repeat", () => {
    const out = interleave([["a"], ["b"]]);
    assert.equal(longestRun(out, (x) => x), 1);
  });

  test("empty groups are skipped rather than producing gaps", () => {
    const out = interleave([[], ["a", "b"], [], ["c"]]);
    assert.deepEqual([...out].sort(), ["a", "b", "c"]);
    assert.equal(out.length, 3);
  });

  test("a single group is returned intact and in order", () => {
    // Nothing to interleave against — the order must not be scrambled,
    // because a single-skill block is a deliberate choice elsewhere
    // (chapter tests, mastery rungs) and this must not fight it.
    assert.deepEqual(interleave([[1, 2, 3, 4]]), [1, 2, 3, 4]);
  });

  test("no groups produces no items", () => {
    assert.deepEqual(interleave([]), []);
    assert.deepEqual(interleave([[], []]), []);
  });

  test("longestRun handles the empty and singleton cases", () => {
    assert.equal(longestRun([], (x) => String(x)), 0);
    assert.equal(longestRun(["a"], (x) => x), 1);
  });

  test("minPossibleRun is 1 only when no group exceeds the gaps around the rest", () => {
    assert.equal(minPossibleRun([3, 3, 3]), 1);
    assert.equal(minPossibleRun([5, 4]), 1);
    assert.equal(minPossibleRun([6, 1]), 3); // ceil(6/2)
    assert.equal(minPossibleRun([10]), 10);
    assert.equal(minPossibleRun([]), 0);
    assert.equal(minPossibleRun([0, 0]), 0);
  });
});
