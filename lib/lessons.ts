import fs from "node:fs";
import path from "node:path";
import {
  CHAPTER_LABELS,
  FUNDAMENTAL_SKILLS,
  STRATEGY_CHAPTERS,
  SUBTOPICS_BY_SKILL,
  type ChapterKey,
  type FundamentalSkill,
} from "./taxonomy.ts";

/** Original concept chapters — one per subtopic, plus the strategy
 *  chapters (cross-cutting method, no question pool) — written and
 *  math-reviewed through the platform's agent gates. Markdown in the
 *  app's dialect. */
export type LessonMeta = {
  subtopic: ChapterKey;
  /** The skill group on the Learn index; strategy chapters form their
   *  own group. */
  skill: FundamentalSkill | "strategy";
  title: string;
  minutes: number;
};

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

function lessonPath(subtopic: ChapterKey): string {
  return path.join(LESSONS_DIR, `${subtopic}.md`);
}

export function readLesson(
  subtopic: ChapterKey,
): { title: string; body: string } | null {
  const file = lessonPath(subtopic);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8").trim();
  const lines = raw.split("\n");
  const title = lines[0]?.replace(/^#\s+/, "").trim() || CHAPTER_LABELS[subtopic];
  return { title, body: lines.slice(1).join("\n").trim() };
}

/** Chapters in display order (grouped by skill as on the index page,
 *  strategy chapters last), so chapter numbers and prev/next navigation
 *  match what the reader sees. */
export function listLessons(): LessonMeta[] {
  const out: LessonMeta[] = [];
  const push = (subtopic: ChapterKey, skill: LessonMeta["skill"]) => {
    const lesson = readLesson(subtopic);
    if (!lesson) return;
    const words = lesson.body.split(/\s+/).length;
    out.push({
      subtopic,
      skill,
      title: lesson.title,
      minutes: Math.max(3, Math.round(words / 200)),
    });
  };
  for (const skill of FUNDAMENTAL_SKILLS) {
    for (const subtopic of SUBTOPICS_BY_SKILL[skill]) push(subtopic, skill);
  }
  for (const chapter of STRATEGY_CHAPTERS) push(chapter, "strategy");
  return out;
}
