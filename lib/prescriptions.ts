import { benchSeconds, SINK_RATIO } from "./pacing.ts";
import { prereqsFor } from "./lesson-prereqs.ts";
import {
  STRATEGY_NOTE_TITLES,
  type StrategyNoteId,
} from "./strategy.ts";
import {
  ERROR_TYPE_LABELS,
  SUBTOPIC_LABELS,
  type ErrorType,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * Miss-to-prescription: what to actually do about a tagged miss.
 *
 * The playbook note *Reading your misses* is the spec — this module is the
 * product doing what it says. Every error type routes to a concrete
 * destination rather than to advice: content_gap to the chapter (deep
 * linked, prerequisite first), setup_error to the chapter's cue list and
 * the translation chapter, calculation_error to the chapter's speed moves,
 * time_pressure to the pacing note with this attempt's own numbers,
 * misread and guess to their playbook notes.
 *
 * Pure and synchronous: it takes the facts of one attempt and returns
 * links. `ERROR_TYPES` semantics are untouched — this reads them, it does
 * not redefine them.
 */

export type PrescriptionStep = {
  /** Short imperative, e.g. "Reread the prerequisite chapter". */
  label: string;
  /** One line of why, in the playbook's voice. */
  detail: string;
  href: string;
  /** The primary step gets the filled button; the rest are quiet links. */
  primary?: boolean;
};

export type Prescription = {
  errorType: ErrorType;
  errorLabel: string;
  /** The one-sentence diagnosis, in the playbook's terms. */
  diagnosis: string;
  steps: PrescriptionStep[];
  /** Only for time_pressure: this attempt's own pacing read. */
  pacing: {
    seconds: number;
    benchSeconds: number;
    ratio: number;
    sink: boolean;
  } | null;
};

export type PrescriptionInput = {
  errorType: ErrorType;
  /** Where the miss happened. Falls back to the question's own subtopic. */
  subtopic: Subtopic;
  difficulty: number;
  timeSeconds: number;
};

function chapter(subtopic: Subtopic, anchor?: string): string {
  return `/learn/${subtopic}${anchor ? `#${anchor}` : ""}`;
}

function note(id: StrategyNoteId, anchor?: string): string {
  return `/strategy/${id}${anchor ? `#${anchor}` : ""}`;
}

export function prescribe(input: PrescriptionInput): Prescription {
  const { errorType, subtopic } = input;
  const label = SUBTOPIC_LABELS[subtopic];
  const prereqs = prereqsFor(subtopic);
  const base = {
    errorType,
    errorLabel: ERROR_TYPE_LABELS[errorType],
    pacing: null,
  };

  switch (errorType) {
    case "content_gap": {
      // The chapter you failed is often not the chapter you were in.
      const steps: PrescriptionStep[] = [];
      if (prereqs.length > 0) {
        steps.push({
          label: `Reread ${SUBTOPIC_LABELS[prereqs[0]]} first`,
          detail:
            "A content gap here usually turns out to be a gap in what this chapter builds on.",
          href: chapter(prereqs[0], "ideas"),
          primary: true,
        });
      }
      steps.push({
        label: `Reread ${label} — the core ideas`,
        detail: "You would not have produced the method with unlimited time.",
        href: chapter(subtopic, "ideas"),
        primary: prereqs.length === 0,
      });
      if (prereqs.length > 1) {
        steps.push({
          label: `Also: ${SUBTOPIC_LABELS[prereqs[1]]}`,
          detail: "The other chapter this one leans on.",
          href: chapter(prereqs[1], "ideas"),
        });
      }
      steps.push({
        label: "Retake the chapter test",
        detail:
          "Clear the bar before drilling — drilling a rule you don't have only proves you don't have it.",
        href: chapter(subtopic, "checklist"),
      });
      return { ...base, diagnosis: "You did not have the rule.", steps };
    }

    case "setup_error":
      return {
        ...base,
        diagnosis: "You had the rule and pointed it at the wrong thing.",
        steps: [
          {
            label: `${label} — the trigger cues`,
            detail:
              "Phrase on the left, method on the right. Setup errors repeat with uncanny fidelity.",
            href: chapter(subtopic, "cues"),
            primary: true,
          },
          {
            label: "Algebraic translation",
            detail: "Where every setup error eventually lives.",
            href: chapter("algebraic_translation", "cues"),
          },
          {
            label: "Cement the cue list",
            detail:
              "Push this chapter's pack into the deck so the cues come back at you for a week.",
            href: chapter(subtopic, "checklist"),
          },
        ],
      };

    case "calculation_error":
      return {
        ...base,
        diagnosis: "The setup was right and the arithmetic betrayed you.",
        steps: [
          {
            label: `${label} — the speed moves`,
            detail:
              "Legitimate shortcuts remove steps, and a step you never take is a step you cannot fumble.",
            href: chapter(subtopic, "speed"),
            primary: true,
          },
          {
            label: "Run pattern rounds",
            detail:
              "Calculation errors scale with every question you attempt. Make the fundamentals automatic.",
            href: "/patterns",
          },
        ],
      };

    case "misread":
      return {
        ...base,
        diagnosis: "You solved a question the test did not ask.",
        steps: [
          {
            label: "Reading the stem",
            detail:
              "Circle the target noun before you start; reread the last sentence before you select.",
            href: note("reading-the-stem"),
            primary: true,
          },
          {
            label: `${label} — the trap gallery`,
            detail:
              "The quantity you computed by misreading is a listed choice, deliberately.",
            href: chapter(subtopic, "traps"),
          },
        ],
      };

    case "time_pressure": {
      const bench = benchSeconds(input.difficulty);
      const ratio = bench > 0 ? input.timeSeconds / bench : 0;
      const sink = ratio > SINK_RATIO;
      return {
        ...base,
        diagnosis: "You knew how, and the clock took it.",
        pacing: {
          seconds: input.timeSeconds,
          benchSeconds: bench,
          ratio,
          sink,
        },
        steps: [
          {
            label: sink
              ? "Pacing — the sixty-second decision"
              : "Pacing and the clock",
            detail: sink
              ? "This ran past the sink threshold. The trainable skill is bailing at sixty seconds, not going faster."
              : "The fix is almost never \"go faster\" — it is \"bail earlier\".",
            href: note("pacing-and-the-clock", sink ? "the-sixty-second-decision" : undefined),
            primary: true,
          },
          {
            label: "Run a timed set",
            detail:
              "A timing failure cannot be trained untimed. More drilling will not touch it.",
            href: "/timed",
          },
          {
            label: `${label} — the speed moves`,
            detail: "If the same subtopic keeps sinking, the shortcuts are the fix.",
            href: chapter(subtopic, "speed"),
          },
        ],
      };
    }

    case "guess":
      return {
        ...base,
        diagnosis: "You had no path and picked.",
        steps: [
          {
            label: "Guessing and bailing",
            detail:
              "A deliberate guess costs one question; a panicked one costs three. Which was this?",
            href: note("guessing-and-bailing"),
            primary: true,
          },
          {
            label: "Find the missing rule, then retag",
            detail:
              "A guess is a content gap that hasn't been diagnosed yet. Work it untimed, then tag what was actually missing.",
            href: chapter(subtopic, "ideas"),
          },
        ],
      };
  }
}

/** The playbook note that owns each error type, for cross-links. */
export const ERROR_TYPE_NOTE: Record<ErrorType, StrategyNoteId> = {
  content_gap: "reading-your-misses",
  setup_error: "reading-your-misses",
  calculation_error: "reading-your-misses",
  misread: "reading-the-stem",
  time_pressure: "pacing-and-the-clock",
  guess: "guessing-and-bailing",
};

export const ERROR_TYPE_NOTE_TITLES = STRATEGY_NOTE_TITLES;
