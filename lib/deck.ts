import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  deckReviews,
  lessonReviews,
  questions,
} from "./db/schema.ts";
import { previewIntervals, type ReviewGrade } from "./srs.ts";
import { SUBTOPIC_LABELS, type Subtopic } from "./taxonomy.ts";

/**
 * The takeaway deck: every missed question's one-line Takeaway becomes a
 * flashcard (front: the trigger cue — when to reach for the method;
 * back: the takeaway), and every passed chapter contributes its trigger
 * cues and trap gallery as concept cards (lib/lesson-cards.ts).
 * Scheduling is graded recall (lib/srs.ts): due cards always appear —
 * question-derived cards first, concept cards after — and new misses
 * fill the remaining slots up to the daily cap.
 */
export type DeckCard = {
  /** Question-derived takeaway, or a chapter cue/trap concept card. */
  source: "question" | "cue" | "trap";
  /** questions.id for question cards; lesson_reviews.id otherwise. */
  id: number;
  subtopic: Subtopic;
  subtopicLabel: string;
  front: string;
  back: string;
  /** When the source miss happened; null for concept cards. */
  missedAgo: Date | null;
  state: "due" | "new";
  /** Interval (days) each grade would schedule, for the button labels. */
  intervals: Record<ReviewGrade, number>;
};

const DECK_SIZE = 12;

function section(md: string, header: string): string | null {
  const idx = md.indexOf(`**${header}**`);
  if (idx < 0) return null;
  const rest = md.slice(idx + header.length + 4);
  const next = rest.indexOf("**");
  return (next < 0 ? rest : rest.slice(0, next)).trim();
}

export async function todaysDeck(): Promise<{
  cards: DeckCard[];
  due: number;
  fresh: number;
  scheduled: number;
}> {
  const misses = await db
    .select({
      questionId: attempts.questionId,
      createdAt: attempts.createdAt,
      subtopic: questions.subtopic,
      solutionMd: questions.solutionMd,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      and(
        eq(attempts.correct, false),
        eq(attempts.focus, "focused"),
        eq(questions.verified, true),
      ),
    )
    .orderBy(desc(attempts.id))
    .limit(300)
    .all();

  const reviews = new Map(
    (await db.select().from(deckReviews).all()).map((r) => [r.questionId, r]),
  );

  // One card per question (most recent miss wins), newest first.
  const seen = new Set<number>();
  const duePool: DeckCard[] = [];
  const freshPool: DeckCard[] = [];
  let scheduled = 0;
  const now = Date.now();
  for (const m of misses) {
    if (seen.has(m.questionId)) continue;
    seen.add(m.questionId);
    const cue = section(m.solutionMd, "Trigger cue");
    const takeaway = section(m.solutionMd, "Takeaway");
    if (!cue || !takeaway) continue;
    const review = reviews.get(m.questionId) ?? null;
    if (review && review.dueAt.getTime() > now) {
      scheduled++;
      continue;
    }
    const card: DeckCard = {
      source: "question",
      id: m.questionId,
      subtopic: m.subtopic,
      subtopicLabel: SUBTOPIC_LABELS[m.subtopic],
      front: cue,
      back: takeaway,
      missedAgo: m.createdAt,
      state: review ? "due" : "new",
      intervals: previewIntervals(review),
    };
    if (review) duePool.push(card);
    else freshPool.push(card);
  }

  // Longest-overdue first; every due card shows, new misses fill the rest.
  duePool.sort(
    (a, b) =>
      (reviews.get(a.id)?.dueAt.getTime() ?? 0) -
      (reviews.get(b.id)?.dueAt.getTime() ?? 0),
  );

  // Concept cards from passed chapters, due now, longest-overdue first.
  // Question-derived cards keep priority; concept cards absorb whatever
  // the cap leaves, and the rest waits for tomorrow.
  const allConcept = await db
    .select()
    .from(lessonReviews)
    .where(eq(lessonReviews.retired, false))
    .all();
  const conceptRows = allConcept.filter((r) => r.dueAt.getTime() <= now);
  scheduled += allConcept.length - conceptRows.length;
  conceptRows.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  const conceptPool: DeckCard[] = conceptRows.map((r) => ({
    source: r.kind,
    id: r.id,
    subtopic: r.subtopic,
    subtopicLabel: SUBTOPIC_LABELS[r.subtopic],
    front: r.front,
    back: r.back,
    missedAgo: null,
    state: r.reps > 0 ? "due" : "new",
    intervals: previewIntervals(r),
  }));

  // Scheduled reviews outrank first sightings; question-derived cards
  // outrank concept cards within each class.
  const dueConcept = conceptPool.filter((c) => c.state === "due");
  const newConcept = conceptPool.filter((c) => c.state === "new");
  const cards: DeckCard[] = [];
  for (const pool of [duePool, dueConcept, freshPool, newConcept]) {
    cards.push(...pool.slice(0, Math.max(0, DECK_SIZE - cards.length)));
  }
  return {
    cards,
    due: duePool.length + dueConcept.length,
    fresh: freshPool.length + newConcept.length,
    scheduled,
  };
}
