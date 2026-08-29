import Link from "next/link";
import { LearnPrepared, ReadBadge } from "@/components/lesson/learn-progress";
import { requireFeature } from "@/lib/billing/entitlements";
import { chapterTestStates } from "@/lib/chapter-tests";
import { getI18n } from "@/lib/i18n/server";
import { skillLabel } from "@/lib/i18n/labels";
import { listLessons } from "@/lib/lessons";
import { FUNDAMENTAL_SKILLS } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const METHOD = ["read", "attempt", "tick", "drill"] as const;

export default async function LearnPage() {
  const { sdb } = await requireFeature("learn");
  const { locale, t } = await getI18n();
  const lessons = listLessons(locale);
  const tests = await chapterTestStates(sdb);
  const passedCount = lessons.filter((l) => tests[l.subtopic]?.passed).length;
  let chapterNo = 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-xl font-semibold">
            {t("learn.title")}
          </h1>
          <p className="text-xs text-graphite">
            {passedCount > 0
              ? t("learn.ledeWithTests", {
                  count: lessons.length,
                  passed: passedCount,
                })
              : t("learn.lede", { count: lessons.length })}
          </p>
        </div>
        <div className="mt-1">
          <LearnPrepared subtopics={lessons.map((l) => l.subtopic)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHOD.map((step, i) => (
          <div
            key={step}
            className="rounded-card border border-grid bg-surface px-3.5 py-3 shadow-ambient"
          >
            <p className="font-mono text-[10px] text-ballpoint">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-sm font-medium">
              {t(`learn.method.${step}Step`)}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-graphite">
              {t(`learn.method.${step}Detail`)}
            </p>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <p className="rounded-card border border-grid bg-surface p-6 text-sm text-graphite shadow-ambient">
          {t("learn.empty")}
        </p>
      )}

      {FUNDAMENTAL_SKILLS.map((skill) => {
        const group = lessons.filter((l) => l.skill === skill);
        if (group.length === 0) return null;
        return (
          <section key={skill}>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="font-display text-sm font-semibold">
                {skillLabel(t, skill)}
              </h2>
              <span className="font-mono text-[11px] text-graphite">
                {t("learn.chapters", { count: group.length })}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.map((lesson) => {
                chapterNo++;
                return (
                  <Link
                    key={lesson.subtopic}
                    href={`/learn/${lesson.subtopic}`}
                    className="group flex items-start gap-3 rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient transition-colors hover:border-ballpoint/50 hover:bg-highlight/40"
                  >
                    <span className="mt-0.5 font-mono text-[11px] text-graphite transition-colors group-hover:text-ballpoint">
                      {String(chapterNo).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium transition-colors group-hover:text-ballpoint">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] text-graphite">
                        <span>
                          ~{lesson.minutes} {t("common.minutes")}
                        </span>
                        {tests[lesson.subtopic]?.passed ? (
                          <span className="text-ballpoint">
                            {t("learn.testPassed")}
                          </span>
                        ) : tests[lesson.subtopic] ? (
                          <span className="text-amber">
                            {t("learn.testScore", {
                              correct: tests[lesson.subtopic]!.lastCorrect,
                              total: tests[lesson.subtopic]!.lastTotal,
                            })}
                          </span>
                        ) : null}
                        <ReadBadge subtopic={lesson.subtopic} />
                      </span>
                    </span>
                    <span
                      className="mt-0.5 text-graphite/50 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
