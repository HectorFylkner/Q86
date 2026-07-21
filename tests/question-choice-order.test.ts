import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSessionChoiceOrders,
  canonicalIndexFromDisplay,
  choicesInDisplayOrder,
  createChoiceOrder,
  displayIndexFromCanonical,
  isChoiceOrder,
  parsePersistedChoiceOrder,
  trapMapInDisplayOrder,
} from "../lib/question-choice-order.ts";

test("PS orders are deterministic bijections and round-trip every index", () => {
  for (let seed = 0; seed < 1_000; seed++) {
    const first = createChoiceOrder({
      format: "problem_solving",
      questionUid: "q86-seed-combinatorics-0123456789ab",
      sessionSeed: `session-${seed}`,
    });
    const second = createChoiceOrder({
      format: "problem_solving",
      questionUid: "q86-seed-combinatorics-0123456789ab",
      sessionSeed: `session-${seed}`,
    });
    assert.deepEqual(first, second);
    assert.equal(isChoiceOrder(first.displayToCanonical), true);
    assert.deepEqual(
      [...first.displayToCanonical].sort((a, b) => a - b),
      [0, 1, 2, 3, 4],
    );
    for (let canonical = 0; canonical < 5; canonical++) {
      const display = displayIndexFromCanonical(canonical, first);
      assert.equal(canonicalIndexFromDisplay(display, first), canonical);
    }
  }
});

test("DS retains canonical identity order", () => {
  const order = createChoiceOrder({
    format: "data_sufficiency",
    questionUid: "q86-seed-ds-0123456789ab",
    sessionSeed: "any-session",
  });
  assert.deepEqual(order.displayToCanonical, [0, 1, 2, 3, 4]);
});

test("session order data survives JSON persistence", () => {
  const persisted = buildSessionChoiceOrders(
    [
      {
        uid: "q86-seed-algebra-0123456789ab",
        format: "problem_solving",
      },
      {
        uid: "q86-seed-ds-0123456789ab",
        format: "data_sufficiency",
      },
    ],
    "session-86",
  );
  const restored = JSON.parse(JSON.stringify(persisted));
  assert.equal(restored.version, 1);
  assert.equal(restored.seed, "session-86");
  assert.deepEqual(
    parsePersistedChoiceOrder(
      restored.byQuestionUid["q86-seed-algebra-0123456789ab"],
    ),
    persisted.byQuestionUid["q86-seed-algebra-0123456789ab"],
  );
  assert.deepEqual(
    restored.byQuestionUid["q86-seed-ds-0123456789ab"].displayToCanonical,
    [0, 1, 2, 3, 4],
  );
});

test("display choices, answer key, and trap map stay aligned", () => {
  const order = createChoiceOrder({
    format: "problem_solving",
    questionUid: "q86-seed-algebra-0123456789ab",
    sessionSeed: "alignment-fixture",
  });
  const choices = ["A", "B", "C", "D", "E"];
  const canonicalKey = 2;
  const traps: Record<string, string> = {
    0: "trap A",
    1: "trap B",
    3: "trap D",
    4: "trap E",
  };
  const displayedChoices = choicesInDisplayOrder(choices, order);
  const displayedTraps = trapMapInDisplayOrder(traps, order);
  const displayedKey = displayIndexFromCanonical(canonicalKey, order);

  assert.equal(displayedChoices[displayedKey], choices[canonicalKey]);
  for (let display = 0; display < 5; display++) {
    const canonical = canonicalIndexFromDisplay(display, order);
    assert.equal(displayedChoices[display], choices[canonical]);
    assert.equal(displayedTraps[String(display)], traps[String(canonical)]);
  }
  assert.deepEqual(parsePersistedChoiceOrder(order), order);
  assert.equal(
    parsePersistedChoiceOrder({ ...order, displayToCanonical: [0, 0, 1, 2, 3] }),
    null,
  );
});

test("PS key placement is approximately uniform across session seeds", () => {
  const counts = [0, 0, 0, 0, 0];
  const samples = 10_000;
  for (let seed = 0; seed < samples; seed++) {
    const order = createChoiceOrder({
      format: "problem_solving",
      questionUid: "q86-seed-ratios-0123456789ab",
      sessionSeed: `distribution-${seed}`,
    });
    counts[displayIndexFromCanonical(2, order)]++;
  }
  const expected = samples / 5;
  for (const count of counts) {
    assert.ok(
      Math.abs(count - expected) / expected < 0.08,
      `distribution ${counts.join(", ")} exceeded 8% tolerance`,
    );
  }
});
