import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Md } from "@/components/math";
import { resolveFlag } from "@/lib/actions";
import { currentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { dateFnsLocale } from "@/lib/i18n/format";
import { flagReasonLabel, subtopicLabel } from "@/lib/i18n/labels";
import { questionFlags, questions } from "@/lib/db/schema";


/**
 * Open content flags, with resolve / retire actions.
 *
 * Triage is deliberately cross-tenant: a flag is a report about the shared
 * bank, and retiring a question affects every account, so the operator has
 * to see every account's reports. That makes this one of the few surfaces
 * that legitimately reads past the tenant predicate — and therefore one
 * that must refuse to render for anyone but an admin. M6 moves it into the
 * admin section proper; the guard is here so it is never merely hidden.
 *
 * Renders nothing for non-admins, and nothing when the list is empty.
 */
export async function FlagsCard() {
  const viewer = await currentUser();
  if (viewer?.role !== "admin") return null;
  const { locale, t } = await getI18n();

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
        <h2 className="font-display text-sm font-semibold">
          {t("flags.title")}
        </h2>
        <span className="font-mono text-[11px] text-graphite">
          {t("flags.open", { count: open.length })}
        </span>
      </div>
      <ul className="mt-3 divide-y divide-grid">
        {open.map((f) => (
          <li key={f.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-[11px] text-graphite">
              <span className="font-medium text-redpen">
                {flagReasonLabel(t, f.reason)}
              </span>
              <span>{subtopicLabel(t, f.subtopic)}</span>
              <span>
                {formatDistanceToNow(new Date(f.createdAt), {
                  addSuffix: true,
                  locale: dateFnsLocale(locale),
                })}
              </span>
              {!f.verified && (
                <span className="text-amber">{t("flags.retired")}</span>
              )}
            </div>
            <div className="mt-1 text-sm text-graphite">
              <Md source={f.stemMd.slice(0, 220)} />
            </div>
            {f.note && (
              <p className="mt-1 text-sm">
                <span className="text-graphite">{t("flags.note")}</span>{" "}
                {f.note}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={resolveFlag.bind(null, f.id, false)}>
                <button className="rounded-control border border-grid px-3 py-1.5 text-xs text-graphite transition-colors hover:border-graphite/50 hover:text-ink">
                  {t("flags.dismiss")}
                </button>
              </form>
              {f.verified && (
                <form action={resolveFlag.bind(null, f.id, true)}>
                  <button className="rounded-control border border-redpen/50 px-3 py-1.5 text-xs font-medium text-redpen transition-colors hover:bg-redpen/10">
                    {t("flags.retire")}
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
