// Curriculum CI gate: every chapter in content/lessons/ must parse against
// the lesson template, and the chapter set must mirror the taxonomy 1:1.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseLesson } from "../lib/lesson-parse.ts";
import { ALL_SUBTOPICS } from "../lib/taxonomy.ts";

const LESSONS_DIR = fileURLToPath(
  new URL("../content/lessons", import.meta.url),
);

const files = fs
  .readdirSync(LESSONS_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

// Mirrors readLesson in lib/lessons.ts: line one is the H1 title, the rest
// is the body handed to parseLesson.
function bodyOf(file: string): string {
  const raw = fs.readFileSync(path.join(LESSONS_DIR, file), "utf8").trim();
  return raw.split("\n").slice(1).join("\n").trim();
}

describe("lesson corpus", () => {
  it("has exactly 24 chapters", () => {
    expect(files).toHaveLength(24);
    expect(ALL_SUBTOPICS).toHaveLength(24);
  });

  it("filenames match taxonomy subtopics 1:1", () => {
    const names = files.map((f) => f.replace(/\.md$/, ""));
    expect(names).toEqual([...ALL_SUBTOPICS].sort());
  });

  it("every file opens with an H1 title", () => {
    for (const file of files) {
      const first = fs
        .readFileSync(path.join(LESSONS_DIR, file), "utf8")
        .trim()
        .split("\n")[0];
      expect(first, file).toMatch(/^#\s+\S/);
    }
  });

  describe.each(files)("%s", (file) => {
    const parsed = parseLesson(bodyOf(file));

    it("parses against the template", () => {
      expect(parsed).not.toBeNull();
    });

    it("satisfies the section contract", () => {
      if (!parsed) return; // covered above
      expect(parsed.why.trim().length).toBeGreaterThan(0);

      expect(parsed.ideas.length).toBeGreaterThanOrEqual(3);
      for (const idea of parsed.ideas) expect(idea.trim()).not.toBe("");

      expect(parsed.examples).toHaveLength(3);
      expect(parsed.examples.map((e) => e.n)).toEqual([1, 2, 3]);
      for (const ex of parsed.examples) {
        expect(ex.question.trim()).not.toBe("");
        expect(ex.work.trim()).not.toBe("");
        expect(ex.answer.trim()).not.toBe("");
      }

      // Cues are authored as "trigger → action"; a null act means the
      // arrow was dropped or malformed.
      expect(parsed.cues.length).toBeGreaterThanOrEqual(3);
      for (const cue of parsed.cues) {
        expect(cue.see.trim()).not.toBe("");
        expect(cue.act).not.toBeNull();
        expect(cue.act!.trim()).not.toBe("");
      }

      for (const list of [parsed.traps, parsed.speed]) {
        expect(list.length).toBeGreaterThanOrEqual(3);
        for (const entry of list) {
          expect(entry.body.trim()).not.toBe("");
          if (entry.name !== null) expect(entry.name.trim()).not.toBe("");
        }
      }

      expect(parsed.checklist.length).toBeGreaterThanOrEqual(3);
      for (const item of parsed.checklist) expect(item.trim()).not.toBe("");
    });
  });
});

// Minimal body that satisfies every template rule; malformed cases below
// are single mutations of it.
const VALID = `## Why this matters
Some lede text.

## The core ideas

1. Idea one.
2. Idea two.
3. Idea three.

## Worked examples

**Example 1**

*Question one?*

Work for one.

**Answer: A**

**Example 2**

*Question two?*

Work for two.

**Answer: B**

**Example 3**

*Question three?*

Work for three.

**Answer: C**

## Trigger cues

- see one → act one
- see two → act two
- see three → act three

## Trap gallery

- **Trap one.** Body one.
- Body two.
- **Trap three.** Body three.

## Speed moves

- **Move one.** Body one.
- **Move two.** Body two.
- Body three.

## Before you drill

1. Check one.
2. Check two.
3. Check three.
`;

describe("parseLesson on synthetic input", () => {
  it("accepts the minimal valid template", () => {
    const p = parseLesson(VALID);
    expect(p).not.toBeNull();
    expect(p!.ideas).toHaveLength(3);
    expect(p!.examples.map((e) => e.answer)).toEqual(["A", "B", "C"]);
    expect(p!.cues[0]).toEqual({ see: "see one", act: "act one" });
    expect(p!.traps[0]).toEqual({ name: "Trap one", body: "Body one." });
    expect(p!.traps[1]).toEqual({ name: null, body: "Body two." });
    expect(p!.checklist).toHaveLength(3);
  });

  it("returns null when a canonical section is missing", () => {
    expect(parseLesson(VALID.replace("## Speed moves", "## Speedy moves"))).toBeNull();
    expect(parseLesson("")).toBeNull();
  });

  it("returns null with fewer than three worked examples", () => {
    const twoExamples = VALID.replace(
      /\*\*Example 3\*\*[\s\S]*?\*\*Answer: C\*\*\n/,
      "",
    );
    expect(parseLesson(twoExamples)).toBeNull();
  });

  it("returns null when an example lacks an Answer line", () => {
    expect(parseLesson(VALID.replace("**Answer: B**\n", ""))).toBeNull();
  });
});
