import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { attributeError, type AttributionInput } from "../lib/error-inference.ts";
import { classifyTrap } from "../lib/trap-classify.ts";
import { RUSH_RATIO, SINK_RATIO, TIME_BENCH } from "../lib/pacing.ts";

const base = (over: Partial<AttributionInput> = {}): AttributionInput => ({
  correct: false,
  timeSeconds: TIME_BENCH[4],
  difficulty: 4,
  confidence: "lean",
  selectedIndex: 0,
  correctIndex: 3,
  chosenTrap: null,
  subtopicAccuracy: null,
  subtopicAttempts: 0,
  ...over,
});

/**
 * A misdiagnosed miss trains the wrong repair, so the inference has to be
 * right about the cases it is confident on and honest about the rest.
 */
describe("error attribution", () => {
  test("a correct answer produces no attribution at all", () => {
    const a = attributeError(base({ correct: true }));
    assert.deepEqual(a.candidates, []);
    assert.equal(a.best, null);
    assert.equal(a.uncertain, false);
  });

  test("the chosen distractor's own trap sentence is the strongest signal", () => {
    const a = attributeError(
      base({
        chosenTrap:
          "Answers with the round-trip distance instead of the separation.",
      }),
    );
    assert.equal(a.best?.errorType, "misread");
    assert.ok(a.best!.evidence.some((e) => /answer chosen/i.test(e.fact)));
  });

  test("a declared guess is attributed as a guess", () => {
    const a = attributeError(base({ confidence: "guess" }));
    assert.equal(a.best?.errorType, "guess");
  });

  test("far too fast and wrong reads as time pressure, not content", () => {
    const bench = TIME_BENCH[4];
    const a = attributeError(base({ timeSeconds: bench * RUSH_RATIO - 5 }));
    assert.equal(a.best?.errorType, "time_pressure");
  });

  test("far too SLOW and wrong must never read as time pressure", () => {
    // The repairs are opposite: rushing needs slowing down, a sink needs
    // abandoning earlier and learning the method.
    const bench = TIME_BENCH[4];
    const a = attributeError(base({ timeSeconds: bench * SINK_RATIO + 30 }));
    assert.notEqual(a.best?.errorType, "time_pressure");
    assert.ok(
      a.candidates.every((c) => c.errorType !== "time_pressure"),
      "a time sink was offered time_pressure as a candidate",
    );
  });

  test("a weak subtopic history pushes toward a content gap", () => {
    const a = attributeError(
      base({ subtopicAccuracy: 0.3, subtopicAttempts: 12 }),
    );
    assert.equal(a.best?.errorType, "content_gap");
    assert.ok(a.best!.evidence.some((e) => /pattern, not an accident/.test(e.fact)));
  });

  test("a strong subtopic history pushes toward execution, not content", () => {
    const a = attributeError(
      base({ subtopicAccuracy: 0.9, subtopicAttempts: 14 }),
    );
    assert.ok(["calculation_error", "misread"].includes(a.best!.errorType));
    assert.ok(
      a.candidates.every((c) => c.errorType !== "content_gap"),
      "a strong subtopic still offered content_gap",
    );
  });

  test("thin history is ignored rather than over-read", () => {
    const withThin = attributeError(
      base({ subtopicAccuracy: 0.2, subtopicAttempts: 3 }),
    );
    const withNone = attributeError(base({ subtopicAccuracy: null }));
    assert.deepEqual(
      withThin.candidates.map((c) => c.errorType),
      withNone.candidates.map((c) => c.errorType),
    );
  });

  test("no evidence at all is reported as uncertain, not as a confident label", () => {
    const a = attributeError(base());
    assert.ok(a.uncertain, "an evidence-free miss claimed certainty");
  });

  test("confidences are normalized and rank strongest first", () => {
    const a = attributeError(
      base({
        confidence: "guess",
        timeSeconds: TIME_BENCH[4] * RUSH_RATIO - 5,
        subtopicAccuracy: 0.2,
        subtopicAttempts: 20,
      }),
    );
    const sum = a.candidates.reduce((s, c) => s + c.confidence, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `confidences summed to ${sum}`);
    for (let i = 1; i < a.candidates.length; i++) {
      assert.ok(a.candidates[i - 1].confidence >= a.candidates[i].confidence);
    }
  });

  test("every candidate carries the evidence that produced it", () => {
    const a = attributeError(
      base({ confidence: "lock", subtopicAccuracy: 0.35, subtopicAttempts: 10 }),
    );
    assert.ok(a.candidates.length > 0);
    for (const c of a.candidates) {
      assert.ok(c.evidence.length > 0, `${c.errorType} had no evidence`);
      for (const e of c.evidence) assert.ok(e.fact.length > 10);
    }
  });
});

describe("trap classification", () => {
  test("classifies the vocabularies the bank actually uses", () => {
    assert.equal(
      classifyTrap("Answers with the ending balance instead of the interest."),
      "misread",
    );
    assert.equal(
      classifyTrap("Flips the sign of the correction, subtracting it."),
      "calculation_error",
    );
    assert.equal(
      classifyTrap("Runs the alligation lever backwards."),
      "setup_error",
    );
    assert.equal(
      classifyTrap("Adds the percents to a net +10%."),
      "content_gap",
    );
  });

  test("returns null rather than guessing on an unfamiliar phrasing", () => {
    assert.equal(classifyTrap("The quick brown fox."), null);
  });
});
