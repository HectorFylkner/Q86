/**
 * Chapter gate: every subtopic has a chapter, and every chapter survives
 * the parser contract in lib/lesson-parse.ts.
 *
 * The chapter page falls back to raw markdown when parseLesson returns
 * null, so a chapter that drifts off the seven-section template degrades
 * silently — it just loses its worked-example cards, cue grid, and trap
 * gallery. Worse, the card packs in lib/lesson-cards.ts are derived from
 * exactly those parsed sections, so a drifted chapter would quietly stop
 * feeding the spaced deck. This gate makes that loud.
 *
 * Usage: pnpm verify:lessons   (exits 1 on any failure)
 */

import { chapterPack } from "../lib/lesson-cards.ts";
import { parseLesson } from "../lib/lesson-parse.ts";
import { readLesson } from "../lib/lessons.ts";
import { ALL_SUBTOPICS, SUBTOPIC_LABELS } from "../lib/taxonomy.ts";

let failures = 0;
const fail = (subtopic: string, message: string) => {
  failures++;
  console.error(`✗ ${subtopic}: ${message}`);
};

let cues = 0;
let checks = 0;
let traps = 0;

for (const subtopic of ALL_SUBTOPICS) {
  const lesson = readLesson(subtopic);
  if (!lesson) {
    fail(subtopic, `no chapter file (content/lessons/${subtopic}.md)`);
    continue;
  }
  if (!lesson.title.trim()) fail(subtopic, "empty title");

  const parsed = parseLesson(lesson.body);
  if (!parsed) {
    fail(
      subtopic,
      "does not satisfy the parser contract — the page would fall back to raw markdown and the card pack would be empty",
    );
    continue;
  }

  // The parser already enforces its own minimums (3 examples, ≥3 of each
  // list); assert the pedagogy on top of it.
  if (parsed.ideas.length < 5)
    fail(subtopic, `only ${parsed.ideas.length} core ideas (want ≥ 5)`);
  if (parsed.cues.length < 4)
    fail(subtopic, `only ${parsed.cues.length} trigger cues (want ≥ 4)`);
  if (parsed.cues.some((c) => c.act == null))
    fail(subtopic, "a trigger cue is missing its → action half");
  if (parsed.traps.length < 4)
    fail(subtopic, `only ${parsed.traps.length} traps (want ≥ 4)`);
  if (parsed.checklist.length < 5)
    fail(subtopic, `only ${parsed.checklist.length} checklist items (want ≥ 5)`);
  for (const ex of parsed.examples) {
    if (!ex.answer.trim()) fail(subtopic, `example ${ex.n} has no answer line`);
  }

  // The pack is what reaches the deck, so assert on the cards themselves,
  // not just on the sections they came from. Both chapter house styles for
  // traps (bold name, or wrong-turn-then-fix prose) must yield cards.
  const pack = chapterPack(subtopic);
  const byKind = (kind: string) => pack.filter((c) => c.kind === kind).length;
  if (byKind("cue") < 4)
    fail(subtopic, `card pack has only ${byKind("cue")} cue cards (want ≥ 4)`);
  if (byKind("trap") < 4)
    fail(subtopic, `card pack has only ${byKind("trap")} trap cards (want ≥ 4)`);
  if (byKind("check") < 5)
    fail(subtopic, `card pack has only ${byKind("check")} concept checks (want ≥ 5)`);
  const ids = new Set(pack.map((c) => c.id));
  if (ids.size !== pack.length)
    fail(subtopic, "card pack contains duplicate card ids");
  for (const c of pack) {
    if (!c.front.trim() || !c.back.trim())
      fail(subtopic, `card ${c.id} has an empty side`);
  }

  cues += byKind("cue");
  checks += byKind("check");
  traps += byKind("trap");
}

console.log(
  `Chapters: ${ALL_SUBTOPICS.length} subtopics, ${Object.keys(SUBTOPIC_LABELS).length} labels — ${cues} trigger cues, ${checks} concept checks, ${traps} named traps available as cards.`,
);

if (failures > 0) {
  console.error(`${failures} chapter failures.`);
  process.exit(1);
}
console.log("All chapters satisfy the parser contract.");
