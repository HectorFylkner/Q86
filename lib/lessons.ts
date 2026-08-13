import fs from "node:fs";
import path from "node:path";
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
const STRATEGY_DIR = path.join(process.cwd(), "content", "strategy");

/** Chapter prerequisites: which chapters a reader should have absorbed
 *  first. Structural, not gating — the chapter page renders them as
 *  "builds on" links and derives the reverse ("feeds into") map. */
export const LESSON_PREREQS: Partial<Record<Subtopic, Subtopic[]>> = {
  divisibility_gcf_lcm: ["prime_factorization"],
  remainders_units_digits: ["divisibility_gcf_lcm"],
  consecutive_evenly_spaced: ["parity_signs"],
  exponents_roots_properties: ["prime_factorization"],
  must_be_true_testing: ["parity_signs", "abs_value_number_line_decimals"],
  quadratics_factoring: ["linear_systems"],
  inequalities: ["quadratics_factoring", "abs_value_number_line_decimals"],
  functions_sequences: ["linear_systems"],
  algebraic_translation: ["linear_systems"],
  min_max_optimization: ["inequalities", "quadratics_factoring"],
  ratios_proportions: ["algebraic_translation"],
  percent_change_chains: ["ratios_proportions"],
  rates_speed_work: ["ratios_proportions"],
  mixtures_weighted_avg: ["ratios_proportions", "percent_change_chains"],
  interest_profit_discount: ["percent_change_chains"],
  overlapping_sets: ["algebraic_translation"],
  combinatorics: ["prime_factorization"],
  probability: ["combinatorics"],
  statistics_mean_median_sd: ["consecutive_evenly_spaced"],
  series_patterns: ["exponents_roots_properties", "remainders_units_digits"],
};

/** Reverse of LESSON_PREREQS: chapters that build on this one. */
export function lessonDependents(subtopic: Subtopic): Subtopic[] {
  const out: Subtopic[] = [];
  for (const [sub, reqs] of Object.entries(LESSON_PREREQS)) {
    if (reqs?.includes(subtopic)) out.push(sub as Subtopic);
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

// ---------------------------------------------------------------------------
// The playbook: cross-chapter strategy notes. Doctrine that no single
// subtopic owns — pacing, number testing, answer-choice leverage, error
// reading — kept in content/strategy/ and surfaced as first-class pages.
// ---------------------------------------------------------------------------

export const STRATEGY_SLUGS = [
  "two-minute-decision",
  "number-testing",
  "backsolving-estimation",
  "reading-your-misses",
] as const;
export type StrategySlug = (typeof STRATEGY_SLUGS)[number];

export type StrategyMeta = {
  slug: StrategySlug;
  title: string;
  minutes: number;
};

export function readStrategyNote(
  slug: StrategySlug,
): { title: string; body: string } | null {
  const file = path.join(STRATEGY_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  const title = lines[0]?.replace(/^#\s+/, "").trim() || slug;
  return { title, body: lines.slice(1).join("\n").trim() };
}

export function listStrategyNotes(): StrategyMeta[] {
  const out: StrategyMeta[] = [];
  for (const slug of STRATEGY_SLUGS) {
    const note = readStrategyNote(slug);
    if (!note) continue;
    const words = note.body.split(/\s+/).length;
    out.push({
      slug,
      title: note.title,
      minutes: Math.max(3, Math.round(words / 200)),
    });
  }
  return out;
}
