import { RUSH_RATIO, SINK_RATIO, TIME_BENCH } from "./pacing.ts";
import { classifyTrap } from "./trap-classify.ts";
import {
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  type Confidence,
  type Difficulty,
  type ErrorType,
} from "./taxonomy.ts";

/**
 * Why a miss happened — inferred from evidence, not guessed from timing.
 *
 * The old behaviour was that a miss went untagged unless the user tagged
 * it, and an untagged miss teaches nothing: it never reaches the heatmap,
 * never shapes the plan, and never names a repair. Auto-tagging on a
 * hunch is worse — a misdiagnosed miss trains the wrong repair.
 *
 * So this returns a *ranked* set of candidates, each carrying the
 * evidence that produced it and a strength, and the caller shows the top
 * one as a suggestion the user confirms or overrides in one tap. The
 * strongest evidence available is the distractor itself: since the
 * quality pass, every wrong choice in the bank is proved to be produced
 * by a specific named mistake, so which wrong answer was chosen is a
 * direct observation about which mistake was made.
 */

export type ErrorEvidence = {
  /** What was observed, in the words the UI shows. */
  fact: string;
  /** How much it moves the inference, 0..1. */
  weight: number;
};

export type ErrorCandidate = {
  errorType: ErrorType;
  label: string;
  /** 0..1, normalized across candidates. */
  confidence: number;
  evidence: ErrorEvidence[];
};

export type AttributionInput = {
  correct: boolean;
  timeSeconds: number;
  difficulty: Difficulty;
  confidence: Confidence;
  selectedIndex: number;
  correctIndex: number;
  /** The trap sentence for the chosen wrong index, when the bank has one. */
  chosenTrap: string | null;
  /** Recent accuracy in this subtopic, 0..1, or null with too little data. */
  subtopicAccuracy: number | null;
  /** How many focused attempts that accuracy is over. */
  subtopicAttempts: number;
};

export type Attribution = {
  /** Ranked, strongest first. Empty for a correct answer. */
  candidates: ErrorCandidate[];
  /** The suggestion, or null when nothing rose above a guess. */
  best: ErrorCandidate | null;
  /** True when the evidence is thin enough that the user should decide. */
  uncertain: boolean;
};

/** Below this, the platform says so rather than pretending to know. */
const CERTAINTY_BAR = 0.4;

export function attributeError(input: AttributionInput): Attribution {
  if (input.correct) return { candidates: [], best: null, uncertain: false };

  const scores = new Map<ErrorType, number>();
  const evidence = new Map<ErrorType, ErrorEvidence[]>();
  const add = (type: ErrorType, weight: number, fact: string) => {
    scores.set(type, (scores.get(type) ?? 0) + weight);
    const list = evidence.get(type) ?? [];
    list.push({ fact, weight });
    evidence.set(type, list);
  };

  const bench = TIME_BENCH[input.difficulty];
  const ratio = bench > 0 ? input.timeSeconds / bench : 1;

  // --- 1. the distractor itself -------------------------------------------
  // The strongest signal there is: the bank proves this choice is what the
  // named mistake produces, so picking it is evidence the mistake was made.
  if (input.chosenTrap) {
    const fromTrap = classifyTrap(input.chosenTrap);
    if (fromTrap) {
      add(
        fromTrap,
        1,
        `The answer chosen is the one this question builds from a specific mistake: "${trimTo(input.chosenTrap, 110)}"`,
      );
    }
  }

  // --- 2. declared confidence ---------------------------------------------
  if (input.confidence === "guess") {
    add(
      "guess",
      0.8,
      "You marked this a guess before submitting, so no method was committed to.",
    );
  } else if (input.confidence === "lock") {
    // A confident miss is not a slip of attention; it is a belief that is
    // wrong. That points at content or setup, and away from carelessness.
    add(
      "content_gap",
      0.35,
      "You locked this answer in — a confident miss usually means the method itself is wrong, not that attention slipped.",
    );
    add("setup_error", 0.25, "Locked-in misses more often come from the setup than the arithmetic.");
  }

  // --- 3. time on task -----------------------------------------------------
  if (ratio < RUSH_RATIO) {
    add(
      "time_pressure",
      0.6,
      `Answered in ${Math.round(input.timeSeconds)}s against a ${bench}s benchmark — under half, too fast to have finished the setup.`,
    );
    add("misread", 0.3, "Answers this fast usually skip a condition in the stem.");
  } else if (ratio > SINK_RATIO) {
    // Long and wrong is the signature of not knowing the method, not of
    // rushing. It is important this does NOT read as time pressure: the
    // repair is the opposite one.
    add(
      "content_gap",
      0.5,
      `Spent ${Math.round(input.timeSeconds)}s against a ${bench}s benchmark — the time went somewhere, and it was not into a method that worked.`,
    );
    add("setup_error", 0.3, "A long wrong answer often means the setup never resolved.");
  }

  // --- 4. history in this subtopic ----------------------------------------
  if (input.subtopicAccuracy != null && input.subtopicAttempts >= 6) {
    if (input.subtopicAccuracy < 0.5) {
      add(
        "content_gap",
        0.55,
        `${Math.round(input.subtopicAccuracy * 100)}% on this subtopic across ${input.subtopicAttempts} recent attempts — this is a pattern, not an accident.`,
      );
    } else if (input.subtopicAccuracy >= 0.8) {
      add(
        "calculation_error",
        0.4,
        `${Math.round(input.subtopicAccuracy * 100)}% on this subtopic across ${input.subtopicAttempts} recent attempts — you know this material, so the slip is likelier to be in the execution.`,
      );
      add("misread", 0.25, "Strong subtopic, isolated miss — check what the question actually asked for.");
    }
  }

  // --- 5. proximity of the chosen answer ----------------------------------
  // Choosing the neighbour of the key is a different failure from choosing
  // the far end of the list; the former is usually an execution slip.
  if (Math.abs(input.selectedIndex - input.correctIndex) === 1 && ratio >= RUSH_RATIO) {
    add(
      "calculation_error",
      0.2,
      "The choice picked sits next to the key, which is where near-miss arithmetic lands.",
    );
  }

  const ranked: ErrorCandidate[] = ERROR_TYPES.filter((t) => (scores.get(t) ?? 0) > 0)
    .map((errorType) => ({
      errorType,
      label: ERROR_TYPE_LABELS[errorType],
      confidence: scores.get(errorType) ?? 0,
      evidence: (evidence.get(errorType) ?? []).sort((a, b) => b.weight - a.weight),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const total = ranked.reduce((s, c) => s + c.confidence, 0);
  const normalized = ranked.map((c) => ({
    ...c,
    confidence: total > 0 ? c.confidence / total : 0,
  }));

  const best = normalized[0] ?? null;
  return {
    candidates: normalized,
    best,
    uncertain: best == null || best.confidence < CERTAINTY_BAR,
  };
}

function trimTo(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}
