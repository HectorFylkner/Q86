/**
 * Curriculum-shape audit.
 *
 * Every chapter in Learn — concept, technique, method — is authored against
 * one contract, `parseLesson()`, and a file that deviates renders as an
 * undifferentiated wall of markdown instead of the structured chapter the
 * reader expects. That failure is silent: the page still returns 200.
 *
 * Two invariants and one measurement:
 *
 *   PARSES    every chapter satisfies the seven-section contract, and every
 *             worked example has a question, a body and an answer line
 *   FLOOR     no chapter falls below the shape the curriculum is written to
 *             (core ideas, worked examples, cues, traps, speed moves, and a
 *             checklist), so a thin chapter is a failure rather than a
 *             surprise
 *   DENSITY   worked examples against core ideas, per chapter and overall.
 *             This is the number behind the finding that every chapter
 *             teaches many ideas and demonstrates three: it is printed so it
 *             is defended, and it is deliberately *not* gated, because the
 *             fix is authoring and a gate would only stop new chapters
 *             being written.
 *
 * Usage: node --experimental-strip-types scripts/check-chapters.ts [--json]
 */
import { parseLesson } from "../lib/lesson-parse.ts";
import {
  METHOD_SLUGS,
  TECHNIQUE_SLUGS,
  readLesson,
  readMethod,
  readTechnique,
} from "../lib/lessons.ts";
import { ALL_SUBTOPICS } from "../lib/taxonomy.ts";

const asJson = process.argv.includes("--json");

/** The shape every chapter is written to. Below any of these, the chapter is
 *  thinner than the contract the reader has learned to expect. */
const FLOOR = {
  ideas: 5,
  examples: 3,
  cues: 5,
  traps: 5,
  speed: 4,
  checklist: 5,
};

type Row = {
  slug: string;
  kind: "concept" | "technique" | "method";
  words: number;
  ideas: number;
  examples: number;
  cues: number;
  traps: number;
  speed: number;
  checklist: number;
};

const failures: string[] = [];
const rows: Row[] = [];

const sources: { slug: string; kind: Row["kind"]; read: () => { title: string; body: string } | null }[] = [
  ...ALL_SUBTOPICS.map((s) => ({
    slug: s as string,
    kind: "concept" as const,
    read: () => readLesson(s),
  })),
  ...TECHNIQUE_SLUGS.map((s) => ({
    slug: s as string,
    kind: "technique" as const,
    read: () => readTechnique(s),
  })),
  ...METHOD_SLUGS.map((s) => ({
    slug: s as string,
    kind: "method" as const,
    read: () => readMethod(s),
  })),
];

for (const source of sources) {
  const chapter = source.read();
  if (!chapter) {
    failures.push(`PARSES ${source.slug}: no chapter file`);
    continue;
  }
  const parsed = parseLesson(chapter.body);
  if (!parsed) {
    failures.push(
      `PARSES ${source.slug}: does not satisfy the seven-section contract — it will render as raw markdown`,
    );
    continue;
  }
  for (const [n, example] of parsed.examples.entries()) {
    if (!example.question.trim()) {
      failures.push(`PARSES ${source.slug}: example ${n + 1} has no question`);
    }
    if (!example.answer.trim()) {
      failures.push(`PARSES ${source.slug}: example ${n + 1} has no answer line`);
    }
    if (!example.work.trim()) {
      failures.push(`PARSES ${source.slug}: example ${n + 1} shows no work`);
    }
  }

  const row: Row = {
    slug: source.slug,
    kind: source.kind,
    words: chapter.body.split(/\s+/).filter(Boolean).length,
    ideas: parsed.ideas.length,
    examples: parsed.examples.length,
    cues: parsed.cues.length,
    traps: parsed.traps.length,
    speed: parsed.speed.length,
    checklist: parsed.checklist.length,
  };
  rows.push(row);

  for (const [key, min] of Object.entries(FLOOR) as [keyof typeof FLOOR, number][]) {
    if (row[key] < min) {
      failures.push(`FLOOR ${source.slug}: ${key} ${row[key]} < ${min}`);
    }
  }
}

const totals = rows.reduce(
  (acc, r) => ({
    ideas: acc.ideas + r.ideas,
    examples: acc.examples + r.examples,
    words: acc.words + r.words,
  }),
  { ideas: 0, examples: 0, words: 0 },
);

if (asJson) {
  console.log(JSON.stringify({ rows, totals, failures }, null, 2));
} else {
  console.log("Curriculum shape\n");
  console.log(
    "chapter                          kind       words  ideas  ex  cues  traps  speed  list  ideas/ex",
  );
  for (const r of [...rows].sort(
    (a, b) => b.ideas / b.examples - a.ideas / a.examples,
  )) {
    console.log(
      r.slug.padEnd(32) +
        r.kind.padEnd(10) +
        String(r.words).padStart(6) +
        String(r.ideas).padStart(7) +
        String(r.examples).padStart(4) +
        String(r.cues).padStart(6) +
        String(r.traps).padStart(7) +
        String(r.speed).padStart(7) +
        String(r.checklist).padStart(6) +
        (r.ideas / r.examples).toFixed(1).padStart(10),
    );
  }
  console.log("");
  console.log(`chapters                     ${rows.length}`);
  console.log(
    `  concept ${rows.filter((r) => r.kind === "concept").length} · technique ${rows.filter((r) => r.kind === "technique").length} · method ${rows.filter((r) => r.kind === "method").length}`,
  );
  console.log(`core ideas                   ${totals.ideas}`);
  console.log(`worked examples              ${totals.examples}`);
  console.log(
    `DENSITY  one worked example per ${(totals.ideas / totals.examples).toFixed(1)} core ideas`,
  );
  console.log(
    "         (reported, not gated — the fix is authoring, and a gate here\n" +
      "          would only stop new chapters being written)",
  );
  console.log("");
  if (failures.length === 0) console.log("PASS");
  else for (const f of failures) console.log("FAIL  " + f);
}

process.exit(failures.length === 0 ? 0 : 1);
