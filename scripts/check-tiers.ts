/**
 * Tier-gate audit.
 *
 * The three tiers of a chapter test are a ladder: clear Foundation, then
 * Exam level, then Top band. A ladder whose rungs share questions is not a
 * ladder — a student who clears Foundation and moves up is re-shown the
 * test they just passed. This script measures that property directly
 * rather than trusting the selection code to have it.
 *
 * Two invariants, checked for every subtopic over N independent draws:
 *
 *   DISJOINT   no question id appears in two tiers of the same chapter
 *   MONOTONE   the hardest question of a tier is never harder than the
 *              easiest question of the tier above it
 *
 * Plus a size/range report, so a thin chapter is visible rather than
 * silently short.
 *
 * Usage: node --experimental-strip-types scripts/check-tiers.ts [--draws=N]
 */
import { CHAPTER_TIERS, type ChapterTier } from "../lib/chapter-test-config.ts";
import {
  chapterBands,
  selectChapterTest,
  tierShapeFromBands,
} from "../lib/chapter-tests.ts";
import { ALL_SUBTOPICS, type Subtopic } from "../lib/taxonomy.ts";

const drawsArg = process.argv.find((a) => a.startsWith("--draws="));
const DRAWS = drawsArg ? Number(drawsArg.split("=")[1]) : 5;

type Row = {
  subtopic: Subtopic;
  sizes: Record<ChapterTier, number>;
  ranges: Record<ChapterTier, string>;
  /** Worst overlap seen across draws, per tier pair. */
  overlap: Record<string, number>;
  monotoneBreaks: string[];
};

const rows: Row[] = [];

for (const subtopic of ALL_SUBTOPICS) {
  const row: Row = {
    subtopic,
    sizes: {} as Record<ChapterTier, number>,
    ranges: {} as Record<ChapterTier, string>,
    overlap: {},
    monotoneBreaks: [],
  };

  // The band shape is deterministic, so it is read once and is the same
  // thing the chapter page prints. The invariants below are checked on the
  // *drawn* sets — what a student actually sits.
  const bands = await chapterBands(subtopic);
  for (const tier of CHAPTER_TIERS) {
    const shape = tierShapeFromBands(bands[tier], tier);
    row.sizes[tier] = shape.size;
    row.ranges[tier] = shape.range;
  }

  for (let draw = 0; draw < DRAWS; draw++) {
    const sets: Record<ChapterTier, { ids: number[]; ds: number[] }> = {} as never;
    for (const tier of CHAPTER_TIERS) {
      const qs = await selectChapterTest(subtopic, tier);
      sets[tier] = { ids: qs.map((q) => q.id), ds: qs.map((q) => q.difficulty) };
    }

    for (let i = 0; i < CHAPTER_TIERS.length; i++) {
      for (let j = i + 1; j < CHAPTER_TIERS.length; j++) {
        const a = CHAPTER_TIERS[i];
        const b = CHAPTER_TIERS[j];
        const key = `${a}×${b}`;
        const shared = sets[a].ids.filter((id) => sets[b].ids.includes(id));
        row.overlap[key] = Math.max(row.overlap[key] ?? 0, shared.length);
      }
    }

    for (let i = 1; i < CHAPTER_TIERS.length; i++) {
      const lower = sets[CHAPTER_TIERS[i - 1]].ds;
      const upper = sets[CHAPTER_TIERS[i]].ds;
      if (lower.length === 0 || upper.length === 0) continue;
      if (Math.max(...lower) > Math.min(...upper)) {
        const msg = `${CHAPTER_TIERS[i - 1]} reaches D${Math.max(...lower)} but ${CHAPTER_TIERS[i]} starts at D${Math.min(...upper)}`;
        if (!row.monotoneBreaks.includes(msg)) row.monotoneBreaks.push(msg);
      }
    }
  }
  rows.push(row);
}

const pairKeys = ["foundation×exam", "foundation×top_band", "exam×top_band"];

console.log(
  `Tier-gate audit — ${ALL_SUBTOPICS.length} chapters × ${CHAPTER_TIERS.length} tiers, ${DRAWS} draws each\n`,
);
console.log(
  "chapter".padEnd(30) +
    "found".padStart(9) +
    "exam".padStart(9) +
    "top".padStart(9) +
    "  f×e f×t e×t",
);
for (const r of rows) {
  const cell = (t: ChapterTier) => `${r.sizes[t]} ${r.ranges[t]}`.padStart(9);
  const ov = pairKeys.map((k) => String(r.overlap[k] ?? 0).padStart(3)).join(" ");
  console.log(
    r.subtopic.padEnd(30) +
      cell("foundation") +
      cell("exam") +
      cell("top_band") +
      "  " +
      ov,
  );
}

const overlapping = rows.filter((r) =>
  pairKeys.some((k) => (r.overlap[k] ?? 0) > 0),
);
const nonMonotone = rows.filter((r) => r.monotoneBreaks.length > 0);
const short = rows.filter((r) =>
  CHAPTER_TIERS.some((t) => r.sizes[t] < 4),
);

const worstOverlap = rows.reduce(
  (m, r) => Math.max(m, ...pairKeys.map((k) => r.overlap[k] ?? 0)),
  0,
);
const totalOverlap = rows.reduce(
  (s, r) => s + pairKeys.reduce((t, k) => t + (r.overlap[k] ?? 0), 0),
  0,
);

console.log("");
console.log(`DISJOINT  chapters with any shared question: ${overlapping.length}/${rows.length}`);
console.log(`          worst single-pair overlap: ${worstOverlap} of 6`);
console.log(`          total shared slots across all pairs: ${totalOverlap}`);
for (const r of overlapping) {
  const detail = pairKeys
    .filter((k) => (r.overlap[k] ?? 0) > 0)
    .map((k) => `${k} ${r.overlap[k]}`)
    .join(", ");
  console.log(`          · ${r.subtopic}: ${detail}`);
}
console.log(`MONOTONE  chapters where a tier reaches past the one above: ${nonMonotone.length}/${rows.length}`);
for (const r of nonMonotone) {
  console.log(`          · ${r.subtopic}: ${r.monotoneBreaks.join("; ")}`);
}
console.log(`SIZE      chapters with a tier below the 4-question minimum: ${short.length}/${rows.length}`);
for (const r of short) {
  const detail = CHAPTER_TIERS.filter((t) => r.sizes[t] < 4)
    .map((t) => `${t} ${r.sizes[t]}`)
    .join(", ");
  console.log(`          · ${r.subtopic}: ${detail}`);
}

// Not a gate — a report. A foundation band that reaches D4 is honest about
// itself (the range is printed on the chapter page) but it is still a
// chapter with no easy items to teach the mechanics on.
const foundationTooHard = rows.filter((r) => r.ranges.foundation.includes("D4"));
console.log(
  `FOUNDATION chapters whose easiest band still reaches D4: ${foundationTooHard.length}/${rows.length}`,
);
for (const r of foundationTooHard) {
  console.log(`          · ${r.subtopic}: ${r.ranges.foundation}`);
}

const fail = overlapping.length > 0 || nonMonotone.length > 0 || short.length > 0;
console.log("");
console.log(fail ? "FAIL" : "PASS");
process.exit(fail ? 1 : 0);
