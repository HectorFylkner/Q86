import fs from "node:fs";
import path from "node:path";
import {
  SOLUTION_STRATEGIES,
  STRATEGY_CHAPTER,
  type SolutionStrategy,
} from "./solution-strategy.ts";
import {
  FUNDAMENTAL_SKILLS,
  SUBTOPICS_BY_SKILL,
  SUBTOPIC_LABELS,
  type FundamentalSkill,
  type Subtopic,
} from "./taxonomy.ts";

/** Original concept chapters, one per subtopic, written and math-reviewed
 *  through the platform's agent gates. Markdown in the app's dialect. */
export type LessonMeta = {
  subtopic: Subtopic;
  skill: FundamentalSkill;
  title: string;
  minutes: number;
};

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");
const TECHNIQUES_DIR = path.join(process.cwd(), "content", "techniques");

/**
 * Technique chapters — the cross-cutting half of the curriculum.
 *
 * The 24 content chapters mirror the score report's subtopics, which is
 * the right spine for analytics and the wrong one for teaching: the
 * strongest prep curricula spend as much time on *how to attack a
 * question* as on what it is about, and Q86 had none of that. These
 * chapters teach the approaches, keyed by the strategy the classifier in
 * lib/solution-strategy.ts recognizes, so a chapter and the items that
 * practise it name the same thing.
 *
 * They live under the same /learn/[slug] route: the slugs are disjoint
 * from the subtopic keys, so nothing collides and no new nav appears.
 *
 * Four, not six. `pattern` and `eliminate` are recognized by the
 * classifier and shown in analytics, but they are already taught inside
 * the content chapters that own them — series & patterns, remainders &
 * units digits, must-be-true testing — and a fifth chapter restating
 * that material would be duplication rather than coverage.
 */
export const TECHNIQUE_SLUGS = [
  "technique-backsolve",
  "technique-pick-numbers",
  "technique-estimate",
  "technique-bail",
] as const;
export type TechniqueSlug = (typeof TECHNIQUE_SLUGS)[number];

export function isTechniqueSlug(slug: string): slug is TechniqueSlug {
  return (TECHNIQUE_SLUGS as readonly string[]).includes(slug);
}

export function readTechnique(
  slug: TechniqueSlug,
): { title: string; body: string } | null {
  const file = path.join(TECHNIQUES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  return {
    title: lines[0]?.replace(/^#\s+/, "").trim() || slug,
    body: lines.slice(1).join("\n").trim(),
  };
}

/**
 * The strategy a technique chapter teaches, so a chapter and the bank
 * items that practise it name the same thing. Inverted from
 * STRATEGY_CHAPTER rather than duplicated, so the two cannot drift.
 *
 * `technique-bail` maps to nothing: it is about the clock, not about a
 * solution path, and the only honest way to practise it is a full timed
 * section.
 */
export function techniqueStrategy(
  slug: TechniqueSlug,
): SolutionStrategy | null {
  return SOLUTION_STRATEGIES.find((s) => STRATEGY_CHAPTER[s] === slug) ?? null;
}

/** Where a technique chapter's "prove it" button goes. */
export function techniqueDrillHref(slug: TechniqueSlug): {
  href: string;
  label: string;
} {
  const strategy = techniqueStrategy(slug);
  return strategy
    ? { href: `/drill?strat=${strategy}`, label: "Drill this technique →" }
    : { href: "/timed", label: "Run a timed section →" };
}

export type TechniqueMeta = {
  slug: TechniqueSlug;
  title: string;
  minutes: number;
};

export function listTechniques(): TechniqueMeta[] {
  const out: TechniqueMeta[] = [];
  for (const slug of TECHNIQUE_SLUGS) {
    const chapter = readTechnique(slug);
    if (!chapter) continue;
    out.push({
      slug,
      title: chapter.title,
      minutes: Math.max(3, Math.round(chapter.body.split(/\s+/).length / 200)),
    });
  }
  return out;
}

function lessonPath(subtopic: Subtopic): string {
  return path.join(LESSONS_DIR, `${subtopic}.md`);
}

export function readLesson(
  subtopic: Subtopic,
): { title: string; body: string } | null {
  const file = lessonPath(subtopic);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  const title = lines[0]?.replace(/^#\s+/, "").trim() || SUBTOPIC_LABELS[subtopic];
  return { title, body: lines.slice(1).join("\n").trim() };
}

/** Chapters in display order (grouped by skill, as on the index page), so
 *  chapter numbers and prev/next navigation match what the reader sees. */
export function listLessons(): LessonMeta[] {
  const out: LessonMeta[] = [];
  for (const skill of FUNDAMENTAL_SKILLS) {
    for (const subtopic of SUBTOPICS_BY_SKILL[skill]) {
      const lesson = readLesson(subtopic);
      if (!lesson) continue;
      const words = lesson.body.split(/\s+/).length;
      out.push({
        subtopic,
        skill,
        title: lesson.title,
        minutes: Math.max(3, Math.round(words / 200)),
      });
    }
  }
  return out;
}
