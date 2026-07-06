import { db } from "./db/index.ts";
import {
  lessonExampleAttempts,
  lessonProgress,
  type LessonProgress,
} from "./db/schema.ts";
import type { ChapterKey } from "./taxonomy.ts";

/** All lesson-progress rows, keyed by chapter. Read by the Learn pages
 *  and by the daily plan's curriculum inputs (lib/plan-server.ts). */
export async function lessonProgressBySubtopic(): Promise<
  Map<ChapterKey, LessonProgress>
> {
  const rows = await db.select().from(lessonProgress).all();
  return new Map(rows.map((r) => [r.subtopic, r]));
}

export function checklistDone(row: LessonProgress | undefined): boolean {
  return (
    row != null &&
    row.checklistTotal > 0 &&
    row.checklist.length >= row.checklistTotal
  );
}

/** Every chapter carries exactly this many worked examples; "prepared"
 *  requires a logged commitment on each. */
export const EXAMPLES_PER_CHAPTER = 3;

/** Distinct worked examples with at least one logged commitment, per
 *  chapter. */
export async function exampleAttemptCounts(): Promise<Map<ChapterKey, number>> {
  const rows = await db
    .select({
      subtopic: lessonExampleAttempts.subtopic,
      exampleN: lessonExampleAttempts.exampleN,
    })
    .from(lessonExampleAttempts)
    .all();
  const seen = new Set<string>();
  const counts = new Map<ChapterKey, number>();
  for (const r of rows) {
    const key = `${r.subtopic}|${r.exampleN}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(r.subtopic, (counts.get(r.subtopic) ?? 0) + 1);
  }
  return counts;
}

/** Evidence-based readiness: a chapter is prepared when its checklist
 *  is fully ticked AND every worked example has a logged commitment —
 *  checkbox honesty backed by retrieval evidence. */
export function isPrepared(
  row: LessonProgress | undefined,
  examplesAttempted: number,
): boolean {
  return checklistDone(row) && examplesAttempted >= EXAMPLES_PER_CHAPTER;
}
