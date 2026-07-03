import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions } from "./db/schema.ts";
import { SUBTOPIC_LABELS, type Subtopic } from "./taxonomy.ts";

/**
 * The takeaway deck: every missed question's one-line Takeaway becomes a
 * flashcard (front: the trigger cue — when to reach for the method;
 * back: the takeaway). Today's deck is a deterministic daily rotation
 * over your misses, newest first — no scheduling state to maintain, and
 * two minutes a day compounds.
 */
export type DeckCard = {
  questionId: number;
  subtopic: Subtopic;
  subtopicLabel: string;
  front: string;
  back: string;
  missedAgo: Date;
};

const DECK_SIZE = 12;

function section(md: string, header: string): string | null {
  const idx = md.indexOf(`**${header}**`);
  if (idx < 0) return null;
  const rest = md.slice(idx + header.length + 4);
  const next = rest.indexOf("**");
  return (next < 0 ? rest : rest.slice(0, next)).trim();
}

export async function todaysDeck(dayIndex: number): Promise<{
  cards: DeckCard[];
  poolSize: number;
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
    .where(and(eq(attempts.correct, false), eq(attempts.focus, "focused")))
    .orderBy(desc(attempts.id))
    .limit(300)
    .all();

  // One card per question (most recent miss wins), newest first.
  const seen = new Set<number>();
  const pool: DeckCard[] = [];
  for (const m of misses) {
    if (seen.has(m.questionId)) continue;
    seen.add(m.questionId);
    const cue = section(m.solutionMd, "Trigger cue");
    const takeaway = section(m.solutionMd, "Takeaway");
    if (!cue || !takeaway) continue;
    pool.push({
      questionId: m.questionId,
      subtopic: m.subtopic,
      subtopicLabel: SUBTOPIC_LABELS[m.subtopic],
      front: cue,
      back: takeaway,
      missedAgo: m.createdAt,
    });
  }

  if (pool.length === 0) return { cards: [], poolSize: 0 };
  // Rotate the window daily so old misses resurface on a cycle.
  const offset = (dayIndex * DECK_SIZE) % pool.length;
  const cards: DeckCard[] = [];
  for (let i = 0; i < Math.min(DECK_SIZE, pool.length); i++) {
    cards.push(pool[(offset + i) % pool.length]);
  }
  return { cards, poolSize: pool.length };
}
