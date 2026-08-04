import { eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { edits, sessions } from "./db/schema.ts";
import { EDIT_REASON_LABELS, type EditReason } from "./taxonomy.ts";

/**
 * What Review & Edit has actually done to this reader's score.
 *
 * The review screen used to say, as a fixed string: *"Your record: quant
 * edits have destroyed more points than they earned."* It had never read the
 * record. On a fresh database it asserted a history that did not exist, and
 * on the seeded fixture it was flatly contradicted by the ledger — 11 edits
 * rescued a wrong answer, 0 destroyed a right one.
 *
 * The advice the sentence was carrying is sound and stays: open a question
 * only when you can name a specific error. But advice dressed as a personal
 * statistic is worse than advice, because the one thing a reader can check
 * is whether it is true of them, and here it was checkable and false.
 *
 * Every edit already carries `fromCorrect` and `toCorrect`, so the real
 * number is a count, not an inference.
 */

export type EditOutcome = "rescued" | "destroyed" | "neutral";

export type EditRecord = {
  total: number;
  /** Wrong → right. */
  rescued: number;
  /** Right → wrong. This is the one the caution is about. */
  destroyed: number;
  /** Wrong → wrong, or right → right: the change moved no points. */
  neutral: number;
  /** rescued − destroyed. */
  net: number;
  /** Per stated reason, so a reader can see which of their reasons pays. */
  byReason: {
    reason: EditReason;
    label: string;
    total: number;
    net: number;
  }[];
  /** The reason with the worst net, when it has actually cost points. */
  worstReason: { reason: EditReason; label: string; net: number } | null;
};

export function classifyEdit(fromCorrect: boolean, toCorrect: boolean): EditOutcome {
  if (!fromCorrect && toCorrect) return "rescued";
  if (fromCorrect && !toCorrect) return "destroyed";
  return "neutral";
}

export async function editRecord(): Promise<EditRecord> {
  // Casual sessions are excluded here for the same reason they are excluded
  // everywhere else: an edit made while not really trying is not evidence
  // about how the reader edits under exam conditions.
  const rows = await db
    .select({
      fromCorrect: edits.fromCorrect,
      toCorrect: edits.toCorrect,
      reason: edits.reason,
      config: sessions.config,
    })
    .from(edits)
    .leftJoin(sessions, eq(edits.sessionId, sessions.id))
    .all();

  // A session's focus lives in its config (only attempts carry the column),
  // so it is read from there rather than assumed.
  const counted = rows.filter(
    (r) => (r.config as { focus?: string } | null)?.focus !== "casual",
  );

  let rescued = 0;
  let destroyed = 0;
  let neutral = 0;
  const perReason = new Map<EditReason, { total: number; net: number }>();

  for (const row of counted) {
    const outcome = classifyEdit(row.fromCorrect, row.toCorrect);
    if (outcome === "rescued") rescued++;
    else if (outcome === "destroyed") destroyed++;
    else neutral++;

    const key = row.reason as EditReason;
    const cell = perReason.get(key) ?? { total: 0, net: 0 };
    cell.total++;
    cell.net += outcome === "rescued" ? 1 : outcome === "destroyed" ? -1 : 0;
    perReason.set(key, cell);
  }

  const byReason = [...perReason.entries()]
    .map(([reason, cell]) => ({
      reason,
      label: EDIT_REASON_LABELS[reason],
      total: cell.total,
      net: cell.net,
    }))
    .sort((a, b) => a.net - b.net || b.total - a.total);

  const worst = byReason[0];
  return {
    total: counted.length,
    rescued,
    destroyed,
    neutral,
    net: rescued - destroyed,
    byReason,
    worstReason:
      worst && worst.net < 0
        ? { reason: worst.reason, label: worst.label, net: worst.net }
        : null,
  };
}
