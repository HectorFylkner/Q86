import Link from "next/link";
import { LearnPrepared, ReadBadge } from "@/components/lesson/learn-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { chapterTestStates } from "@/lib/chapter-tests";
import { listLessons } from "@/lib/lessons";
import { FUNDAMENTAL_SKILLS, SKILL_LABELS } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const METHOD = [
  { step: "Read", detail: "the core ideas and cues" },
  { step: "Attempt", detail: "each example before revealing" },
  { step: "Tick", detail: "the pre-drill checklist honestly" },
  { step: "Drill", detail: "the same subtopic while it's warm" },
];

export default async function LearnPage() {
  const lessons = listLessons();
  const tests = await chapterTestStates();
  const passedCount = lessons.filter((l) => tests[l.subtopic]?.passed).length;
  let chapterNo = 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-2xl font-semibold">Learn</h1>
          <p className="text-xs text-graphite">
            {lessons.length} concept chapters, one per drillable subtopic
            {passedCount > 0 &&
              ` — ${passedCount} test${passedCount === 1 ? "" : "s"} passed`}
            .
          </p>
        </div>
        <div className="mt-1">
          <LearnPrepared subtopics={lessons.map((l) => l.subtopic)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHOD.map((m, i) => (
          <div
            key={m.step}
            className="rounded-card border border-grid bg-surface px-3.5 py-3 shadow-ambient"
          >
            <p className="font-mono text-micro text-ballpoint">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-sm font-medium">{m.step}</p>
            <p className="mt-0.5 text-xs leading-snug text-graphite">
              {m.detail}
            </p>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <EmptyState kicker="No chapters yet">
          Chapters are being written — check back shortly.
        </EmptyState>
      )}

      {FUNDAMENTAL_SKILLS.map((skill) => {
        const group = lessons.filter((l) => l.skill === skill);
        if (group.length === 0) return null;
        return (
          <section key={skill}>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="font-display text-base font-semibold">
                {SKILL_LABELS[skill]}
              </h2>
              <span className="font-mono text-caption text-graphite">
                {group.length} chapters
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
                    <span className="mt-0.5 font-mono text-caption text-graphite transition-colors group-hover:text-ballpoint">
                      {String(chapterNo).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium transition-colors group-hover:text-ballpoint">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-3 font-mono text-caption text-graphite">
                        <span>~{lesson.minutes} min</span>
                        {tests[lesson.subtopic]?.passed ? (
                          <span className="text-ballpoint">✓ test passed</span>
                        ) : tests[lesson.subtopic] ? (
                          <span className="text-amber">
                            test {tests[lesson.subtopic]!.lastCorrect}/
                            {tests[lesson.subtopic]!.lastTotal}
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
