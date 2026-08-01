import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { questions } from "./db/schema.ts";
import {
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  type ErrorType,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * The transfer layer of a Learn chapter: the part that turns prose into
 * recognition.
 *
 * A chapter can explain a method perfectly and still leave the reader
 * unable to tell, on the exam, that this is the question the method is
 * for. What closes that gap is (a) the stem cues that actually appear in
 * the bank mapped to the method they select, (b) a worked example at the
 * top difficulty band rather than the middle, and (c) the traps named in
 * exactly the words a post-mortem will use.
 *
 * All three are derived from the installed bank rather than hand-written
 * beside it. That is deliberate: hand-written tables drift from the
 * questions they describe, and the whole point is that reading a chapter
 * and reviewing a miss speak one language. Here they cannot diverge —
 * the recognition rows, the worked example and the trap vocabulary are
 * the same strings the runner and the post-mortem show.
 */

export type RecognitionRow = {
  questionId: number;
  difficulty: number;
  /** The stem pattern to recognize. */
  see: string;
  /** The method it selects. */
  method: string | null;
};

export type TopBandExample = {
  questionId: number;
  difficulty: number;
  stemMd: string;
  choices: string[];
  correctIndex: number;
  fastestPathMd: string;
  formalPathMd: string | null;
  takeaway: string | null;
};

export type NamedTrap = {
  questionId: number;
  difficulty: number;
  /** The error-type vocabulary this trap belongs to, when inferable. */
  errorType: ErrorType | null;
  errorLabel: string;
  text: string;
};

export type ChapterTransfer = {
  recognition: RecognitionRow[];
  topBand: TopBandExample | null;
  traps: NamedTrap[];
  /** Verified bank items behind this chapter, by difficulty. */
  coverage: { total: number; byDifficulty: Record<number, number> };
};

/** Pull one **Header** section out of a solution body. */
function section(md: string, header: string): string | null {
  const at = md.indexOf(`**${header}**`);
  if (at < 0) return null;
  const rest = md.slice(at + header.length + 4);
  const next = rest.indexOf("**");
  const body = (next < 0 ? rest : rest.slice(0, next)).trim();
  return body.length > 0 ? body : null;
}

/**
 * Split a trigger cue into the pattern you see and the method it selects.
 * The bank writes cues in three shapes, and the order below matters: a
 * cue like "A: B — C" must split at the colon, not at the dash, or the
 * method column ends up holding only the tail of the sentence.
 *   1. "When …, reach for …"   (the original chapters' voice)
 *   2. "Pattern: method"        (colon-delimited)
 *   3. "Pattern — method"       (em-dash delimited)
 */
function splitCue(cue: string): { see: string; method: string | null } {
  const flat = cue.replace(/\s+/g, " ").trim();
  const tidy = (s: string) => {
    const t = s.replace(/^when\s+/i, "").replace(/[.,;:\s]+$/, "").trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  const reach = flat.match(/,\s*reach for\s/i);
  if (reach?.index != null) {
    return {
      see: tidy(flat.slice(0, reach.index)),
      method: flat.slice(reach.index + 1).trim(),
    };
  }

  const colon = flat.indexOf(": ");
  if (colon > 0 && colon <= 110) {
    return {
      see: tidy(flat.slice(0, colon)),
      method: flat.slice(colon + 1).trim(),
    };
  }

  const dash = flat.match(/\s[—–]\s/);
  if (dash?.index != null) {
    return {
      see: tidy(flat.slice(0, dash.index)),
      method: flat.slice(dash.index + dash[0].length).trim(),
    };
  }
  return { see: tidy(flat), method: null };
}

/**
 * Map a trap sentence onto the six-error vocabulary the platform uses
 * everywhere else. The phrasing is the author's; the classification is
 * keyword-driven and deliberately conservative — a trap that does not
 * clearly belong to one bucket stays unlabelled rather than being
 * mislabelled, because a wrong label teaches the wrong repair.
 */
const TRAP_SIGNATURES: Array<[ErrorType, RegExp]> = [
  [
    "misread",
    /\b(answers with|reports|reads?|instead of the|rather than the|mis-?reads?|reading|asked for|one step early)\b/i,
  ],
  [
    "setup_error",
    /\b(sets? up|solv(es|ing)\b.*\bfor\b|treats?|assumes?|ignor(es|ing)|forgets? (that|to include)|applies|backwards?|inverts?|reversed?|upside down|wrong base|omits)\b/i,
  ],
  [
    "calculation_error",
    /\b(arithmetic|slips?|off by|drops? (a|the) (sign|factor|term|constant|decimal)|misplaces|sign flip|flips the sign|carel|divides? by|multiplies? by)\b/i,
  ],
  [
    "content_gap",
    /\b(adds? the percents|does not know|never|formula|identity|property|distinctness|complement)\b/i,
  ],
];

function classifyTrap(text: string): ErrorType | null {
  for (const [type, pattern] of TRAP_SIGNATURES) {
    if (pattern.test(text)) return type;
  }
  return null;
}

/** Rank so the most instructive rows sit at the top: hardest first. */
function byDifficultyDesc<T extends { difficulty: number }>(a: T, b: T) {
  return b.difficulty - a.difficulty;
}

const MAX_RECOGNITION_ROWS = 12;
const MAX_TRAPS = 10;

export async function chapterTransfer(
  subtopic: Subtopic,
): Promise<ChapterTransfer> {
  const rows = await db
    .select({
      id: questions.id,
      difficulty: questions.difficulty,
      stemMd: questions.stemMd,
      choices: questions.choices,
      correctIndex: questions.correctIndex,
      solutionMd: questions.solutionMd,
      fastestPathMd: questions.fastestPathMd,
      trapMap: questions.trapMap,
    })
    .from(questions)
    .where(and(eq(questions.subtopic, subtopic), eq(questions.verified, true)))
    .orderBy(desc(questions.difficulty))
    .all();

  const byDifficulty: Record<number, number> = {};
  for (const r of rows) {
    byDifficulty[r.difficulty] = (byDifficulty[r.difficulty] ?? 0) + 1;
  }

  // --- recognition table -------------------------------------------------
  // One row per distinct cue; the hardest item carrying a cue wins, so the
  // reader meets the pattern in its most demanding form.
  const seen = new Set<string>();
  const recognition: RecognitionRow[] = [];
  for (const r of [...rows].sort(byDifficultyDesc)) {
    const cue = section(r.solutionMd, "Trigger cue");
    if (!cue) continue;
    const { see, method } = splitCue(cue);
    const key = see.toLowerCase().replace(/[^a-z0-9 ]/g, "").slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    recognition.push({
      questionId: r.id,
      difficulty: r.difficulty,
      see,
      method,
    });
    if (recognition.length >= MAX_RECOGNITION_ROWS) break;
  }

  // --- top-band worked example ------------------------------------------
  // The hardest item in the chapter, shown whole. Chapters teach at the
  // middle of the curve by default; the exam does not.
  const hardest = rows[0] ?? null;
  const topBand: TopBandExample | null = hardest
    ? {
        questionId: hardest.id,
        difficulty: hardest.difficulty,
        stemMd: hardest.stemMd,
        choices: hardest.choices,
        correctIndex: hardest.correctIndex,
        fastestPathMd: hardest.fastestPathMd,
        formalPathMd: section(hardest.solutionMd, "Formal path"),
        takeaway: section(hardest.solutionMd, "Takeaway"),
      }
    : null;

  // --- named traps -------------------------------------------------------
  // The exact sentences the post-mortem will quote, sorted hardest first
  // and labelled with the platform's own error vocabulary.
  const traps: NamedTrap[] = [];
  for (const r of [...rows].sort(byDifficultyDesc)) {
    for (const [index, text] of Object.entries(r.trapMap)) {
      if (Number(index) === r.correctIndex) continue;
      const errorType = classifyTrap(text);
      traps.push({
        questionId: r.id,
        difficulty: r.difficulty,
        errorType,
        errorLabel: errorType ? ERROR_TYPE_LABELS[errorType] : "Unclassified",
        text,
      });
    }
  }
  // Spread across error types so the section reads as a vocabulary, not a
  // list of one bucket: take the hardest few of each type in turn.
  const buckets = new Map<string, NamedTrap[]>();
  for (const t of traps) {
    const key = t.errorType ?? "unclassified";
    const bucket = buckets.get(key) ?? [];
    bucket.push(t);
    buckets.set(key, bucket);
  }
  const ordered: NamedTrap[] = [];
  const order = [...ERROR_TYPES, "unclassified"];
  for (let round = 0; ordered.length < MAX_TRAPS; round++) {
    let added = false;
    for (const key of order) {
      const bucket = buckets.get(key);
      if (!bucket || bucket.length <= round) continue;
      ordered.push(bucket[round]);
      added = true;
      if (ordered.length >= MAX_TRAPS) break;
    }
    if (!added) break;
  }

  return {
    recognition,
    topBand,
    traps: ordered,
    coverage: { total: rows.length, byDifficulty },
  };
}
