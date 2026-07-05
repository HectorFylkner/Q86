import { and, desc, eq, or } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, deckReviews, questions } from "./db/schema.ts";
import { previewIntervals, type ReviewGrade } from "./srs.ts";
import { SUBTOPIC_LABELS, type Subtopic } from "./taxonomy.ts";

/**
 * The takeaway deck: every missed question's one-line Takeaway becomes a
 * flashcard (front: the trigger cue — when to reach for the method;
 * back: the takeaway). Guessed corrects count as misses here — the cue
 * clearly didn't fire. Scheduling is graded recall (lib/srs.ts): due
 * cards always appear, new misses fill the remaining slots, and cards
 * you know stretch out to longer and longer intervals.
 */
export type DeckCard = {
  questionId: number;
  subtopic: Subtopic;
  subtopicLabel: string;
  front: string;
  back: string;
  missedAgo: Date;
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
        or(eq(attempts.correct, false), eq(attempts.confidence, "guess")),
        eq(attempts.focus, "focused"),
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
      questionId: m.questionId,
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
      (reviews.get(a.questionId)?.dueAt.getTime() ?? 0) -
      (reviews.get(b.questionId)?.dueAt.getTime() ?? 0),
  );
  const cards = [
    ...duePool,
    ...freshPool.slice(0, Math.max(0, DECK_SIZE - duePool.length)),
  ];
  return {
    cards,
    due: duePool.length,
    fresh: freshPool.length,
    scheduled,
  };
}
