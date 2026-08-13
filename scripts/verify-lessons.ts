/**
 * The loud gate for the Learn material. For every concept chapter (or the
 * subtopics passed as arguments) and every playbook note it verifies:
 *   - the chapter parses under the canonical template (parseLesson)
 *   - the course-grade bar holds (lessonProblems strict: 5+ ideas with
 *     3+ inline checks, 4–6 tiered worked examples with pace targets,
 *     wrong-turn notes, cue/trap/speed/checklist floors)
 *   - every $…$ / $$…$$ span compiles under KaTeX with throwOnError
 *     (the app renders with throwOnError:false, which would silently
 *     print broken TeX instead of failing)
 *
 * Usage: node --experimental-strip-types scripts/verify-lessons.ts [subtopic…]
 * Exits 1 on any failure — a chapter that would fall back to the plain
 * markdown path fails here instead of degrading silently.
 */

import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { lessonProblems, parseLesson } from "../lib/lesson-parse.ts";
import { STRATEGY_SLUGS } from "../lib/lessons.ts";
import { ALL_SUBTOPICS } from "../lib/taxonomy.ts";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const STRATEGY_DIR = path.join(process.cwd(), "content", "strategy");

// Mirrors the math tokenizer in components/math.tsx.
const MATH_SPAN = /\$\$([\s\S]+?)\$\$|\$((?:\\.|[^\\$\n])+?)\$/g;

function katexProblems(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(MATH_SPAN)) {
    const [span, block, inline] = m;
    const tex = block ?? inline;
    try {
      katex.renderToString(tex, {
        throwOnError: true,
        displayMode: Boolean(block),
        strict: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      out.push(`KaTeX rejects ${span.slice(0, 60)} — ${msg}`);
    }
  }
  return out;
}

function checkFile(
  file: string,
  kind: "chapter" | "note",
): string[] {
  if (!fs.existsSync(file)) return ["file missing"];
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  const problems: string[] = [];
  if (!/^#\s+\S/.test(lines[0] ?? "")) problems.push("missing # title line");
  const body = lines.slice(1).join("\n").trim();

  if (kind === "chapter") {
    problems.push(...lessonProblems(body, true));
    if (problems.length === 0 && !parseLesson(body)) {
      problems.push("parseLesson returned null despite passing lint");
    }
  } else if (!/^##\s+\S/m.test(body)) {
    problems.push('no "## …" sections');
  }
  problems.push(...katexProblems(body));
  return problems;
}

const args = process.argv.slice(2);
const subtopics =
  args.length > 0
    ? args
    : (ALL_SUBTOPICS as readonly string[]);

let failures = 0;
let passed = 0;

for (const sub of subtopics) {
  if (!(ALL_SUBTOPICS as readonly string[]).includes(sub)) {
    console.error(`✗ ${sub}: not a subtopic in lib/taxonomy.ts`);
    failures++;
    continue;
  }
  const problems = checkFile(
    path.join(LESSONS_DIR, `${sub}.md`),
    "chapter",
  );
  if (problems.length > 0) {
    failures++;
    console.error(`✗ ${sub}`);
    for (const p of problems) console.error(`    ${p}`);
  } else {
    passed++;
  }
}

// Playbook notes ride along on every full run.
if (args.length === 0) {
  for (const slug of STRATEGY_SLUGS) {
    const problems = checkFile(
      path.join(STRATEGY_DIR, `${slug}.md`),
      "note",
    );
    if (problems.length > 0) {
      failures++;
      console.error(`✗ strategy/${slug}`);
      for (const p of problems) console.error(`    ${p}`);
    } else {
      passed++;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} file(s) failed, ${passed} passed.`);
  process.exit(1);
}
console.log(`✓ ${passed} file(s) verified against the course-grade bar.`);
