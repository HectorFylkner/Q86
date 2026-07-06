import { eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { lessonReviews } from "./db/schema.ts";
import { parseLesson, type ParsedLesson } from "./lesson-parse.ts";
import { readLesson } from "./lessons.ts";
import type { ChapterKey } from "./taxonomy.ts";

/**
 * Concept-level retrieval cards, cut from a chapter's trigger cues and
 * trap gallery when its test is passed. Retrieval-first by
 * construction: the front is the cue phrase (or the trap's wrong turn)
 * and the user produces the action (or the fix) before revealing —
 * never a passive reread of the chapter.
 */

export type LessonCardSeed = {
  kind: "cue" | "trap";
  ordinal: number;
  front: string;
  back: string;
};

/** Split an untitled trap bullet into wrong turn → fix. Authors write
 *  these as "mistake — fix", "mistake: fix", or "mistake. Fix …", so
 *  try those separators in order; a bullet with no split point is not
 *  retrievable and produces no card. */
function splitTrapBody(body: string): { front: string; back: string } | null {
  for (const sep of [" — ", " – ", ": ", ". "]) {
    const at = body.indexOf(sep);
    if (at > 10 && at < body.length - 10) {
      return {
        front: body.slice(0, at).trim(),
        back: body.slice(at + sep.length).trim(),
      };
    }
  }
  return null;
}

export function buildLessonCards(parsed: ParsedLesson): LessonCardSeed[] {
  const seeds: LessonCardSeed[] = [];
  parsed.cues.forEach((cue, ordinal) => {
    if (!cue.act) return;
    seeds.push({ kind: "cue", ordinal, front: cue.see, back: cue.act });
  });
  parsed.traps.forEach((trap, ordinal) => {
    if (trap.name) {
      seeds.push({ kind: "trap", ordinal, front: trap.name, back: trap.body });
      return;
    }
    const split = splitTrapBody(trap.body);
    if (split) seeds.push({ kind: "trap", ordinal, ...split });
  });
  return seeds;
}

/** Enroll (or refresh) a chapter's cards. Idempotent: scheduling state
 *  survives re-enrollment — only the card text refreshes — and cards
 *  whose source bullet left the chapter retire rather than delete. New
 *  cards enter due immediately; the deck's daily cap paces them out. */
export async function enrollLessonCards(subtopic: ChapterKey): Promise<number> {
  const lesson = readLesson(subtopic);
  if (!lesson) return 0;
  const parsed = parseLesson(lesson.body);
  if (!parsed) return 0;
  const seeds = buildLessonCards(parsed);
  const now = new Date();
  for (const seed of seeds) {
    await db
      .insert(lessonReviews)
      .values({
        subtopic,
        kind: seed.kind,
        ordinal: seed.ordinal,
        front: seed.front,
        back: seed.back,
        dueAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          lessonReviews.subtopic,
          lessonReviews.kind,
          lessonReviews.ordinal,
        ],
        set: {
          front: seed.front,
          back: seed.back,
          retired: false,
          updatedAt: now,
        },
      })
      .run();
  }
  // Any existing card whose (kind, ordinal) is no longer produced by
  // the chapter — the list shrank, or a bullet stopped being
  // retrievable — retires rather than deletes.
  const live = new Set(seeds.map((s) => `${s.kind}|${s.ordinal}`));
  const existing = await db
    .select({
      id: lessonReviews.id,
      kind: lessonReviews.kind,
      ordinal: lessonReviews.ordinal,
    })
    .from(lessonReviews)
    .where(eq(lessonReviews.subtopic, subtopic))
    .all();
  for (const row of existing) {
    if (live.has(`${row.kind}|${row.ordinal}`)) continue;
    await db
      .update(lessonReviews)
      .set({ retired: true, updatedAt: now })
      .where(eq(lessonReviews.id, row.id))
      .run();
  }
  return seeds.length;
}
