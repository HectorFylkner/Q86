import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  deckReviews,
  lessonCardReviews,
  questions,
} from "./db/schema.ts";
import {
  CHAPTER_CARD_ANCHORS,
  CHAPTER_CARD_KIND_LABELS,
  chapterCardIndex,
  normalizeCardFront,
  type ChapterCardKind,
} from "./lesson-cards.ts";
import { previewIntervals, type ReviewGrade, type ReviewState } from "./srs.ts";
import { SUBTOPIC_LABELS, type Subtopic } from "./taxonomy.ts";

/**
 * The deck carries two kinds of card, scheduled by the same engine
 * (lib/srs.ts) and shuffled into one queue.
 *
 *   miss    — every missed question's Takeaway, fronted by its Trigger cue.
 *             Built automatically; you never opt in.
 *   chapter — a chapter's own trigger cues, named traps, and concept
 *             checks, pushed into the deck from the chapter page after
 *             reading. Content is parsed from the markdown every time
 *             (lib/lesson-cards.ts), so the chapter stays the single
 *             source of truth and editing it edits the cards.
 *
 * A chapter cue that duplicates a miss card's cue is dropped: the miss
 * card is the one you earned, and it points at a specific question.
 */

export type DeckCardKind = "miss" | ChapterCardKind;

export type DeckCard = {
  /** Stable across renders; `q:<id>` for misses, the card id for chapters. */
  id: string;
  kind: DeckCardKind;
  kindLabel: string;
  subtopic: Subtopic;
  subtopicLabel: string;
  front: string;
  back: string;
  /** One line of instruction under the front, per card kind. */
  prompt: string;
  /** Miss cards only: the question to re-solve. */
  questionId: number | null;
  /** Chapter cards only: the section of the chapter this came from. */
  chapterAnchor: string | null;
  /** When this card entered the deck. */
  addedAt: Date;
  state: "due" | "new";
  intervals: Record<ReviewGrade, number>;
};

const DECK_SIZE = 12;

const MISS_PROMPT = "What did this one teach you?";

function section(md: string, header: string): string | null {
  const idx = md.indexOf(`**${header}**`);
  if (idx < 0) return null;
  const rest = md.slice(idx + header.length + 4);
  const next = rest.indexOf("**");
  return (next < 0 ? rest : rest.slice(0, next)).trim();
}

function toReviewState(row: {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}): ReviewState {
  return {
    ease: row.ease,
    intervalDays: row.intervalDays,
    reps: row.reps,
    lapses: row.lapses,
  };
}

export type DeckSummary = {
  cards: DeckCard[];
  due: number;
  fresh: number;
  scheduled: number;
  /** Split of the served queue, for the header line. */
  missCount: number;
  chapterCount: number;
};

export async function todaysDeck(): Promise<DeckSummary> {
  const now = Date.now();

  // ---------------------------------------------------------------- misses
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

  const missReviews = new Map(
    (await db.select().from(deckReviews).all()).map((r) => [r.questionId, r]),
  );

  const seenQuestions = new Set<number>();
  const duePool: DeckCard[] = [];
  const freshPool: DeckCard[] = [];
  let scheduled = 0;
  /** Normalized fronts already served by a miss card, for dedup. */
  const missFronts = new Set<string>();

  for (const m of misses) {
    if (seenQuestions.has(m.questionId)) continue;
    seenQuestions.add(m.questionId);
    const cue = section(m.solutionMd, "Trigger cue");
    const takeaway = section(m.solutionMd, "Takeaway");
    if (!cue || !takeaway) continue;
    missFronts.add(normalizeCardFront(cue));
    const review = missReviews.get(m.questionId) ?? null;
    if (review && review.dueAt.getTime() > now) {
      scheduled++;
      continue;
    }
    const card: DeckCard = {
      id: `q:${m.questionId}`,
      kind: "miss",
      kindLabel: "Missed question",
      subtopic: m.subtopic,
      subtopicLabel: SUBTOPIC_LABELS[m.subtopic],
      front: cue,
      back: takeaway,
      prompt: MISS_PROMPT,
      questionId: m.questionId,
      chapterAnchor: null,
      addedAt: m.createdAt,
      state: review ? "due" : "new",
      intervals: previewIntervals(review ? toReviewState(review) : null),
    };
    if (review) duePool.push(card);
    else freshPool.push(card);
  }

  // -------------------------------------------------------- chapter packs
  const packRows = await db.select().from(lessonCardReviews).all();
  if (packRows.length > 0) {
    const index = chapterCardIndex();
    for (const row of packRows) {
      const card = index.get(row.cardId);
      // The chapter was edited and this card no longer exists. Leave the
      // row alone (it costs nothing and a revert restores the schedule);
      // just don't serve a card we can no longer render.
      if (!card) continue;
      if (card.kind === "cue" && missFronts.has(normalizeCardFront(card.front))) {
        continue;
      }
      if (row.dueAt.getTime() > now) {
        scheduled++;
        continue;
      }
      const deckCard: DeckCard = {
        id: card.id,
        kind: card.kind,
        kindLabel: CHAPTER_CARD_KIND_LABELS[card.kind],
        subtopic: card.subtopic,
        subtopicLabel: card.subtopicLabel,
        front: card.front,
        back: card.back,
        prompt: card.prompt,
        questionId: null,
        chapterAnchor: CHAPTER_CARD_ANCHORS[card.kind],
        addedAt: row.addedAt,
        state: row.reps > 0 ? "due" : "new",
        intervals: previewIntervals(row.reps > 0 ? toReviewState(row) : null),
      };
      if (row.reps > 0) duePool.push(deckCard);
      else freshPool.push(deckCard);
    }
  }

  // Longest-overdue first; new cards fill whatever slots remain.
  duePool.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
  // Interleave new misses and new chapter cards so a freshly pushed pack
  // never buries the questions you actually got wrong.
  const newMisses = freshPool.filter((c) => c.kind === "miss");
  const newChapter = freshPool.filter((c) => c.kind !== "miss");
  const interleaved: DeckCard[] = [];
  for (let i = 0; i < Math.max(newMisses.length, newChapter.length); i++) {
    if (i < newMisses.length) interleaved.push(newMisses[i]);
    if (i < newChapter.length) interleaved.push(newChapter[i]);
  }

  const cards = [
    ...duePool,
    ...interleaved.slice(0, Math.max(0, DECK_SIZE - duePool.length)),
  ];
  return {
    cards,
    due: duePool.length,
    fresh: freshPool.length,
    scheduled,
    missCount: cards.filter((c) => c.kind === "miss").length,
    chapterCount: cards.filter((c) => c.kind !== "miss").length,
  };
}

/** How much of a chapter's pack is already in the deck, for its page. */
export async function chapterPackState(subtopic: Subtopic): Promise<{
  inDeck: number;
  dueNow: number;
}> {
  const rows = await db
    .select()
    .from(lessonCardReviews)
    .where(eq(lessonCardReviews.subtopic, subtopic))
    .all();
  const now = Date.now();
  return {
    inDeck: rows.length,
    dueNow: rows.filter((r) => r.dueAt.getTime() <= now).length,
  };
}
