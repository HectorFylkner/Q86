import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "./i18n/types.ts";
import {
  FUNDAMENTAL_SKILLS,
  SUBTOPICS_BY_SKILL,
  SUBTOPIC_LABELS,
  type FundamentalSkill,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * Original concept chapters, one per subtopic, written and math-reviewed
 * through the platform's agent gates.
 *
 * Chapters live per locale under `content/lessons/<locale>/`. A Swedish
 * chapter that has not been written yet falls back to the English one, so
 * a partially translated state is a working state rather than a broken
 * one (ADR 0004).
 *
 * The `##` headings and the `**Example n**` / `**Answer:**` markers inside
 * a chapter are structural, not visible: `lib/lesson-parse.ts` splits on
 * them and `app/learn/[subtopic]/page.tsx` supplies the displayed section
 * titles from the message catalog. A translated chapter therefore keeps
 * the English scaffolding verbatim and translates only the prose — which
 * is also what keeps mathematical notation and GMAT terminology intact.
 */
export type LessonMeta = {
  subtopic: Subtopic;
  skill: FundamentalSkill;
  title: string;
  minutes: number;
  /** True when this chapter is being served in the English fallback. */
  fallback: boolean;
};

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

function lessonPath(subtopic: Subtopic, locale: Locale): string {
  return path.join(LESSONS_DIR, locale, `${subtopic}.md`);
}

export type Lesson = {
  title: string;
  body: string;
  /** The locale actually served, which may differ from the one asked for. */
  locale: Locale;
  fallback: boolean;
};

export function readLesson(
  subtopic: Subtopic,
  locale: Locale = DEFAULT_LOCALE,
): Lesson | null {
  const wanted = lessonPath(subtopic, locale);
  const file = fs.existsSync(wanted)
    ? wanted
    : lessonPath(subtopic, "en");
  if (!fs.existsSync(file)) return null;

  const served: Locale = file === wanted ? locale : "en";
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  const title =
    lines[0]?.replace(/^#\s+/, "").trim() || SUBTOPIC_LABELS[subtopic];
  return {
    title,
    body: lines.slice(1).join("\n").trim(),
    locale: served,
    fallback: served !== locale,
  };
}

/** Chapters in display order (grouped by skill, as on the index page), so
 *  chapter numbers and prev/next navigation match what the reader sees. */
export function listLessons(locale: Locale = DEFAULT_LOCALE): LessonMeta[] {
  const out: LessonMeta[] = [];
  for (const skill of FUNDAMENTAL_SKILLS) {
    for (const subtopic of SUBTOPICS_BY_SKILL[skill]) {
      const lesson = readLesson(subtopic, locale);
      if (!lesson) continue;
      const words = lesson.body.split(/\s+/).length;
      out.push({
        subtopic,
        skill,
        title: lesson.title,
        minutes: Math.max(3, Math.round(words / 200)),
        fallback: lesson.fallback,
      });
    }
  }
  return out;
}

/** Which subtopics have a chapter in this locale — used by the tests and
 *  by the translation status line in docs/PROGRESS.md. */
export function translatedSubtopics(locale: Locale): Subtopic[] {
  return FUNDAMENTAL_SKILLS.flatMap((skill) =>
    SUBTOPICS_BY_SKILL[skill].filter((subtopic) =>
      fs.existsSync(lessonPath(subtopic, locale)),
    ),
  );
}
