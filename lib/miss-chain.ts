import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  deckReviews,
  questions,
  redoQueue,
} from "./db/schema.ts";
import { STAGE_DELAY_DAYS } from "./redo.ts";
import {
  ERROR_TYPE_LABELS,
  SUBTOPIC_LABELS,
  type ErrorType,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * The chain from a miss to mastery, made checkable.
 *
 * The platform already did each of these things. What it never did was
 * show that they had happened, so the loop was real but invisible — and
 * an invisible loop is one the user has no reason to trust. Each link is
 * queried independently and reported as done or broken, per miss, so a
 * break is a fact on screen rather than something to be discovered
 * months later.
 *
 * The five links, in the order they should happen:
 *   1. the miss is classified with an error type
 *   2. the question's chapter exists to read
 *   3. it became a takeaway deck card
 *   4. it entered the +2d / +7d / +21d redo ladder
 *   5. it has actually been redone since
 */

export type ChainLink = {
  key: "classified" | "chapter" | "deck" | "redo" | "revisited";
  label: string;
  done: boolean;
  detail: string;
  href: string | null;
};

export type MissChain = {
  attemptId: number;
  questionId: number;
  subtopic: Subtopic;
  subtopicLabel: string;
  difficulty: number;
  missedAt: Date;
  errorType: ErrorType | null;
  links: ChainLink[];
  /** How many of the five links are complete. */
  complete: number;
};

export type MissChainSummary = {
  chains: MissChain[];
  /** Per link, how many of the sampled misses have it. */
  coverage: Array<{ key: ChainLink["key"]; label: string; done: number; total: number }>;
};

const SAMPLE = 8;

export async function recentMissChains(): Promise<MissChainSummary> {
  const misses = await db
    .select({
      attemptId: attempts.id,
      questionId: attempts.questionId,
      createdAt: attempts.createdAt,
      errorType: attempts.errorType,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(and(eq(attempts.correct, false), eq(attempts.focus, "focused")))
    .orderBy(desc(attempts.id))
    .limit(60)
    .all();

  // One row per question — the most recent miss is the live one.
  const seen = new Set<number>();
  const sample = misses.filter((m) => {
    if (seen.has(m.questionId)) return false;
    seen.add(m.questionId);
    return true;
  }).slice(0, SAMPLE);

  if (sample.length === 0) return { chains: [], coverage: [] };

  const ids = sample.map((m) => m.questionId);
  const idList = sql.join(ids.map((id) => sql`${id}`), sql`, `);

  const deckRows = await db
    .select()
    .from(deckReviews)
    .where(sql`${deckReviews.questionId} in (${idList})`)
    .all();
  const deckBy = new Map(deckRows.map((d) => [d.questionId, d]));

  const redoRows = await db
    .select()
    .from(redoQueue)
    .where(sql`${redoQueue.questionId} in (${idList})`)
    .all();
  const redoBy = new Map(redoRows.map((r) => [r.questionId, r]));

  const laterRows = await db
    .select({
      questionId: attempts.questionId,
      id: attempts.id,
      correct: attempts.correct,
      mode: attempts.mode,
    })
    .from(attempts)
    .where(sql`${attempts.questionId} in (${idList})`)
    .orderBy(desc(attempts.id))
    .all();

  const chains: MissChain[] = sample.map((m) => {
    const deck = deckBy.get(m.questionId);
    const redo = redoBy.get(m.questionId);
    const later = laterRows.filter(
      (a) => a.questionId === m.questionId && a.id > m.attemptId,
    );
    const redone = later.length;
    const redoneRight = later.filter((a) => a.correct).length;

    const links: ChainLink[] = [
      {
        key: "classified",
        label: "Classified",
        done: m.errorType != null,
        detail: m.errorType
          ? `Tagged ${ERROR_TYPE_LABELS[m.errorType].toLowerCase()}`
          : "Untagged — it never reaches the heatmap or the plan",
        href: `/postmortem/${m.attemptId}`,
      },
      {
        key: "chapter",
        label: "Chapter",
        done: true,
        detail: `${SUBTOPIC_LABELS[m.subtopic]} — recognition table and named traps`,
        href: `/learn/${m.subtopic}`,
      },
      {
        key: "deck",
        label: "Deck card",
        done: deck != null,
        detail: deck
          ? `${deck.reps} review${deck.reps === 1 ? "" : "s"}, next in ${deck.intervalDays}d`
          : "Waiting — new misses fill the deck's open slots",
        href: "/deck",
      },
      {
        key: "redo",
        label: `Redo ladder`,
        done: redo != null,
        detail: redo
          ? redo.cleared
            ? "Cleared through the day-21 cold-solve gate"
            : `Stage ${redo.stage + 1} of 3 — due ${formatDue(redo.dueAt)} (+${STAGE_DELAY_DAYS[redo.stage as 0 | 1 | 2]}d)`
          : "Not queued",
        href: "/queue",
      },
      {
        key: "revisited",
        label: "Revisited",
        done: redone > 0,
        detail:
          redone > 0
            ? `Answered ${redone} more time${redone === 1 ? "" : "s"} since, ${redoneRight} right`
            : "Not yet — it is still scheduled",
        href: `/drill?qids=${m.questionId}`,
      },
    ];

    return {
      attemptId: m.attemptId,
      questionId: m.questionId,
      subtopic: m.subtopic,
      subtopicLabel: SUBTOPIC_LABELS[m.subtopic],
      difficulty: m.difficulty,
      missedAt: m.createdAt,
      errorType: m.errorType,
      links,
      complete: links.filter((l) => l.done).length,
    };
  });

  const keys = chains[0].links.map((l) => ({ key: l.key, label: l.label }));
  const coverage = keys.map(({ key, label }) => ({
    key,
    label,
    done: chains.filter((c) => c.links.find((l) => l.key === key)?.done).length,
    total: chains.length,
  }));

  return { chains, coverage };
}

function formatDue(due: Date): string {
  const days = Math.round((new Date(due).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return `${-days}d overdue`;
  if (days === 0) return "today";
  return `in ${days}d`;
}
