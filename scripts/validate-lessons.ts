/**
 * Validates every chapter in content/lessons/ against the lesson dialect,
 * the way verify-bank.ts validates the question bank:
 *   - the file has a "# Title" first line
 *   - parseLesson (lib/lesson-parse.ts) returns non-null — all seven
 *     canonical sections present and every structural minimum met
 *   - section minimums re-asserted explicitly: ≥3 numbered core ideas,
 *     exactly 3 worked examples numbered 1..3, ≥3 trigger cues (each
 *     arrow-split into see → act), ≥3 trap bullets, ≥3 speed bullets,
 *     ≥5 checklist items
 *   - every taxonomy subtopic has a chapter file; extra chapters (e.g.
 *     strategy chapters outside the subtopic taxonomy) are validated
 *     against the same dialect
 *
 * A chapter that fails still renders through the generic <Md> fallback,
 * but it loses the structured layout, the example commitments, and its
 * cue/trap retrieval cards — so a failure here is a real regression.
 *
 * Usage: node --experimental-strip-types scripts/validate-lessons.ts
 * (exits 1 on any failure)
 */

import fs from "node:fs";
import path from "node:path";
import { parseDirectiveLine, validateDirective } from "../lib/directives.ts";
import { parseLesson } from "../lib/lesson-parse.ts";
import { ALL_SUBTOPICS } from "../lib/taxonomy.ts";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

const SECTIONS = [
  "Why this matters",
  "The core ideas",
  "Worked examples",
  "Trigger cues",
  "Trap gallery",
  "Speed moves",
  "Before you drill",
] as const;

let failures = 0;
const fail = (file: string, message: string) => {
  failures++;
  console.error(`✗ ${file}: ${message}`);
};

/** When parseLesson returns null it does not say why; recover the most
 *  likely cause so the author gets an actionable message instead of a
 *  bare "did not parse". */
function diagnose(file: string, body: string): void {
  const present = new Set(
    [...body.matchAll(/^##\s+(.*?)\s*$/gm)].map((m) => m[1]),
  );
  for (const name of SECTIONS) {
    if (!present.has(name)) fail(file, `missing section "## ${name}"`);
  }
  const exampleMarkers = [...body.matchAll(/^\*\*Example\s+\d+/gm)].length;
  const answerMarkers = [...body.matchAll(/\*\*Answer:/g)].length;
  if (exampleMarkers !== 3)
    fail(file, `expected 3 "**Example N**" markers, found ${exampleMarkers}`);
  if (answerMarkers < exampleMarkers)
    fail(
      file,
      `found ${exampleMarkers} examples but only ${answerMarkers} "**Answer: …**" lines`,
    );
  // The generic catch-all when the section-level checks all pass: one of
  // the per-section minimums failed, or an example is missing its
  // italic-wrapped question / numbered work / answer structure.
  fail(
    file,
    "parseLesson returned null — check example structure (italic question, work steps, **Answer: …**) and section minimums",
  );
}

const files = fs
  .readdirSync(LESSONS_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

// Coverage: every drillable subtopic must have its chapter. Extra files
// (strategy chapters outside the taxonomy) are allowed and validated too.
for (const subtopic of ALL_SUBTOPICS) {
  if (!files.includes(`${subtopic}.md`)) {
    fail(`${subtopic}.md`, "no chapter file for this taxonomy subtopic");
  }
}

for (const file of files) {
  const before = failures;
  const raw = fs.readFileSync(path.join(LESSONS_DIR, file), "utf8").trim();
  const lines = raw.split("\n");
  if (!/^#\s+\S/.test(lines[0] ?? "")) {
    fail(file, 'first line must be a "# Title" heading');
    continue;
  }
  const body = lines.slice(1).join("\n").trim();
  const parsed = parseLesson(body);
  if (!parsed) {
    diagnose(file, body);
    continue;
  }

  if (parsed.ideas.length < 3)
    fail(file, `core ideas: ${parsed.ideas.length} numbered items (minimum 3)`);
  if (parsed.examples.length !== 3)
    fail(file, `worked examples: ${parsed.examples.length} (must be exactly 3)`);
  const ns = parsed.examples.map((e) => e.n).join(",");
  if (parsed.examples.length === 3 && ns !== "1,2,3")
    fail(file, `worked examples numbered ${ns} (must be 1,2,3)`);
  if (parsed.cues.length < 3)
    fail(file, `trigger cues: ${parsed.cues.length} bullets (minimum 3)`);
  const unsplit = parsed.cues.filter((c) => c.act == null).length;
  if (unsplit > 0)
    fail(
      file,
      `${unsplit} trigger cue(s) missing the "→" split into see → act`,
    );
  if (parsed.traps.length < 3)
    fail(file, `trap gallery: ${parsed.traps.length} bullets (minimum 3)`);
  if (parsed.speed.length < 3)
    fail(file, `speed moves: ${parsed.speed.length} bullets (minimum 3)`);
  if (parsed.checklist.length < 5)
    fail(
      file,
      `checklist: ${parsed.checklist.length} items (minimum 5, chapters ship with 7)`,
    );

  // Visual directives must be well-formed — a malformed one silently
  // degrades to literal text in the renderer, which is a content bug.
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("::")) continue;
    const directive = parseDirectiveLine(trimmed);
    const problem = directive
      ? validateDirective(directive)
      : "unparseable directive line";
    if (problem) fail(file, `${problem}: ${trimmed.slice(0, 60)}`);
  }

  if (failures === before) {
    console.log(
      `✓ ${file.padEnd(38)} ideas ${String(parsed.ideas.length).padStart(2)} · examples ${parsed.examples.length} · cues ${parsed.cues.length} · traps ${parsed.traps.length} · speed ${parsed.speed.length} · checklist ${parsed.checklist.length}`,
    );
  }
}

console.log(
  `Lessons: ${files.length} files, ${ALL_SUBTOPICS.length} taxonomy subtopics covered.`,
);
if (failures > 0) {
  console.error(`${failures} validation failures.`);
  process.exit(1);
}
console.log("All lesson chapters parse against the dialect.");
