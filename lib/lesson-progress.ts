import { db } from "./db/index.ts";
import { lessonProgress, type LessonProgress } from "./db/schema.ts";
import type { Subtopic } from "./taxonomy.ts";

/** All lesson-progress rows, keyed by chapter. Read by the Learn pages
 *  and by the daily plan's curriculum inputs (lib/plan-server.ts). */
export async function lessonProgressBySubtopic(): Promise<
  Map<Subtopic, LessonProgress>
> {
  const rows = await db.select().from(lessonProgress).all();
  return new Map(rows.map((r) => [r.subtopic, r]));
}

/** A chapter counts as prepared when every checklist item is ticked. */
export function checklistDone(row: LessonProgress | undefined): boolean {
  return (
    row != null &&
    row.checklistTotal > 0 &&
    row.checklist.length >= row.checklistTotal
  );
}
