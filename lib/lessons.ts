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
