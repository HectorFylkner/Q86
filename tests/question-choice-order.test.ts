import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuestionChoiceRoster,
  buildSessionChoiceOrders,
  canonicalIndexForQuestion,
  canonicalIndexFromDisplay,
  choiceOrderForQuestion,
  choicesInDisplayOrder,
  createChoiceOrder,
  displayIndexForQuestion,
  displayIndexFromCanonical,
  isChoiceOrder,
  parsePersistedChoiceOrder,
  parsePersistedQuestionChoiceRoster,
  questionChoiceKey,
  questionInDisplayOrder,
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

test("runtime roster presents aligned fields and inverts display submissions", () => {
  const canonical = {
    id: 86,
    uid: "q86-seed-algebra-runtime0123",
    contentVersion: 4,
    format: "problem_solving" as const,
    choices: ["A", "B", "C", "D", "E"],
    correctIndex: 1,
    trapMap: {
      0: "trap A",
      2: "trap C",
      3: "trap D",
      4: "trap E",
    } as Record<string, string>,
  };
  const roster = buildQuestionChoiceRoster([canonical], "runtime-alignment");
  const restored = parsePersistedQuestionChoiceRoster(
    JSON.parse(JSON.stringify(roster)),
  );
  assert.ok(restored);

  const displayed = questionInDisplayOrder(canonical, restored);
  const displayedKey = displayIndexForQuestion(
    canonical.correctIndex,
    canonical,
    restored,
  );
  assert.equal(displayed.correctIndex, displayedKey);
  assert.equal(displayed.choices[displayedKey], canonical.choices[1]);
  assert.equal(
    canonicalIndexForQuestion(displayedKey, canonical, restored),
    canonical.correctIndex,
  );
  for (let displayIndex = 0; displayIndex < 5; displayIndex++) {
    const canonicalIndex = canonicalIndexForQuestion(
      displayIndex,
      canonical,
      restored,
    );
    assert.equal(
      displayed.choices[displayIndex],
      canonical.choices[canonicalIndex],
    );
    assert.equal(
      displayed.trapMap[String(displayIndex)],
      canonical.trapMap[String(canonicalIndex)],
    );
  }
});

test("UID-less generated identity is stable and content-version mismatches fail closed", () => {
  const generated = {
    id: 987,
    uid: null,
    contentVersion: 1,
    format: "problem_solving" as const,
  };
  assert.equal(
    questionChoiceKey(generated),
    "db:987:v1:fproblem_solving",
  );
  const roster = buildQuestionChoiceRoster([generated], "generated-candidate");
  assert.deepEqual(
    choiceOrderForQuestion(roster, generated),
    roster.byQuestionId["987"].order,
  );
  assert.throws(
    () =>
      choiceOrderForQuestion(
        roster,
        { ...generated, contentVersion: 2 },
      ),
    /changed after this session started/,
  );
  assert.equal(
    parsePersistedQuestionChoiceRoster({
      ...roster,
      byQuestionId: {
        987: {
          ...roster.byQuestionId["987"],
          order: {
            ...roster.byQuestionId["987"].order,
            displayToCanonical: [0, 0, 1, 2, 3],
          },
        },
      },
    }),
    null,
  );
});
