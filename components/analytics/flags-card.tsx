import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Md } from "@/components/math";
import { resolveFlag } from "@/lib/actions";
import { db } from "@/lib/db";
import { questionFlags, questions } from "@/lib/db/schema";
import { FLAG_REASON_LABELS, SUBTOPIC_LABELS } from "@/lib/taxonomy";

/** Open content flags with resolve / retire actions. Renders nothing when
 *  the review list is empty. */
export async function FlagsCard() {
  const open = await db
    .select({
      id: questionFlags.id,
      questionId: questionFlags.questionId,
      reason: questionFlags.reason,
      note: questionFlags.note,
      createdAt: questionFlags.createdAt,
      stemMd: questions.stemMd,
      subtopic: questions.subtopic,
      verified: questions.verified,
    })
    .from(questionFlags)
    .innerJoin(questions, eq(questionFlags.questionId, questions.id))
    .where(eq(questionFlags.status, "open"))
    .orderBy(desc(questionFlags.createdAt))
    .all();

  if (open.length === 0) return null;

  return (
    <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient sm:p-5">
      <div className="flex items-baseline gap-2">
        <h2 className="font-display text-sm font-semibold">Content flags</h2>
        <span className="font-mono text-[11px] text-graphite">
          {open.length} open
        </span>
      </div>
      <ul className="mt-3 divide-y divide-grid">
        {open.map((f) => (
          <li key={f.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-[11px] text-graphite">
              <span className="font-medium text-redpen">
                {FLAG_REASON_LABELS[f.reason]}
              </span>
              <span>{SUBTOPIC_LABELS[f.subtopic]}</span>
              <span>
                {formatDistanceToNow(new Date(f.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {!f.verified && <span className="text-amber">retired</span>}
            </div>
            <div className="mt-1 text-sm text-graphite">
              <Md source={f.stemMd.slice(0, 220)} />
            </div>
            {f.note && (
              <p className="mt-1 text-sm">
                <span className="text-graphite">Note:</span> {f.note}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={resolveFlag.bind(null, f.id, false)}>
                <button className="rounded-control border border-grid px-3 py-1.5 text-xs text-graphite transition-colors hover:border-graphite/50 hover:text-ink">
                  Dismiss — question is fine
                </button>
              </form>
              {f.verified && (
                <form action={resolveFlag.bind(null, f.id, true)}>
                  <button className="rounded-control border border-redpen/50 px-3 py-1.5 text-xs font-medium text-redpen transition-colors hover:bg-redpen/10">
                    Retire question
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
