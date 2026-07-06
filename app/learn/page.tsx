import Link from "next/link";
import { LessonProgressSync } from "@/components/lesson/learn-progress";
import { chapterTestStates } from "@/lib/chapter-tests";
import { qualifiesForTestOut, weaknessScore } from "@/lib/curriculum";
import {
  EXAMPLES_PER_CHAPTER,
  exampleAttemptCounts,
  isPrepared,
  lessonProgressBySubtopic,
} from "@/lib/lesson-progress";
import { listLessons } from "@/lib/lessons";
import { gatherCurriculumRows } from "@/lib/plan-server";
import {
  FUNDAMENTAL_SKILLS,
  SKILL_LABELS,
  type Subtopic,
} from "@/lib/taxonomy";

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
  const progress = await lessonProgressBySubtopic();
  const exampleCounts = await exampleAttemptCounts();
  const rows = new Map(
    (await gatherCurriculumRows()).map((r) => [r.subtopic, r]),
  );
  const passedCount = lessons.filter(
    (l) => l.skill !== "strategy" && tests[l.subtopic as Subtopic]?.passed,
  ).length;
  const preparedCount = lessons.filter((l) =>
    isPrepared(progress.get(l.subtopic), exampleCounts.get(l.subtopic) ?? 0),
  ).length;
  // Chapter numbers stay pinned to the canonical order even though the
  // display order below adapts to the evidence.
  const chapterNo = new Map(lessons.map((l, i) => [l.subtopic, i + 1]));

  return (
    <div className="space-y-5">
      <LessonProgressSync known={[...progress.keys()]} />
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-xl font-semibold">Learn</h1>
          <p className="text-xs text-graphite">
            {lessons.length} concept chapters, one per drillable subtopic
            {passedCount > 0 &&
              ` — ${passedCount} test${passedCount === 1 ? "" : "s"} passed`}
            .
          </p>
        </div>
        <p className="mt-1 text-xs text-graphite">
          Chapters are ordered weakest-first inside each skill group, from
          your drill evidence — passed chapters sink to the bottom.
          {preparedCount > 0 && (
            <span className="text-ballpoint">
              {" "}
              {preparedCount} of {lessons.length} chapters prepared.
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHOD.map((m, i) => (
          <div
            key={m.step}
            className="rounded-card border border-grid bg-surface px-3.5 py-3 shadow-ambient"
          >
            <p className="font-mono text-[10px] text-ballpoint">
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
        <p className="rounded-card border border-grid bg-surface p-6 text-sm text-graphite shadow-ambient">
          Chapters are being written — check back shortly.
        </p>
      )}

      {(() => {
        const strategy = lessons.filter((l) => l.skill === "strategy");
        if (strategy.length === 0) return null;
        return (
          <section>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="font-display text-sm font-semibold">Strategy</h2>
              <span className="font-mono text-[11px] text-graphite">
                cross-cutting method — no chapter test, the mixed drills are
                the test
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {strategy.map((lesson, i) => {
                const p = progress.get(lesson.subtopic);
                const examplesDone =
                  exampleCounts.get(lesson.subtopic) ?? 0;
                const prepared = isPrepared(p, examplesDone);
                return (
                  <Link
                    key={lesson.subtopic}
                    href={`/learn/${lesson.subtopic}`}
                    className="group flex items-start gap-3 rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient transition-colors hover:border-ballpoint/50 hover:bg-highlight/40"
                  >
                    <span className="mt-0.5 font-mono text-[11px] text-graphite transition-colors group-hover:text-ballpoint">
                      S{i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium transition-colors group-hover:text-ballpoint">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] text-graphite">
                        <span>~{lesson.minutes} min</span>
                        {prepared ? (
                          <span className="text-ballpoint">✓ prepared</span>
                        ) : examplesDone > 0 ||
                          (p && p.checklist.length > 0) ? (
                          <span>
                            {examplesDone}/{EXAMPLES_PER_CHAPTER} examples
                            {p && p.checklist.length > 0
                              ? ` · ${p.checklist.length}/${p.checklistTotal} checks`
                              : ""}
                          </span>
                        ) : p?.readAt != null ? (
                          <span>started</span>
                        ) : null}
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
      })()}

      {FUNDAMENTAL_SKILLS.map((skill) => {
        const group = lessons
          .filter((l) => l.skill === skill)
          .sort((a, b) => {
            const ra = rows.get(a.subtopic as Subtopic);
            const rb = rows.get(b.subtopic as Subtopic);
            const pa = ra?.testPassed ? 1 : 0;
            const pb = rb?.testPassed ? 1 : 0;
            if (pa !== pb) return pa - pb;
            const sa = ra ? weaknessScore(ra) : 0;
            const sb = rb ? weaknessScore(rb) : 0;
            return sb - sa;
          });
        if (group.length === 0) return null;
        return (
          <section key={skill}>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="font-display text-sm font-semibold">
                {SKILL_LABELS[skill]}
              </h2>
              <span className="font-mono text-[11px] text-graphite">
                {group.length} chapters
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.map((lesson) => {
                const subtopic = lesson.subtopic as Subtopic;
                const row = rows.get(subtopic);
                const p = progress.get(subtopic);
                const test = tests[subtopic];
                const testOut = row ? qualifiesForTestOut(row) : false;
                const examplesDone = row?.examplesAttempted ?? 0;
                const prepared = isPrepared(p, examplesDone);
                return (
                  <div
                    key={lesson.subtopic}
                    className="group flex items-start gap-3 rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient transition-colors hover:border-ballpoint/50 hover:bg-highlight/40"
                  >
                    <span className="mt-0.5 font-mono text-[11px] text-graphite transition-colors group-hover:text-ballpoint">
                      {String(chapterNo.get(lesson.subtopic)).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/learn/${lesson.subtopic}`}
                      className="min-w-0 flex-1"
                    >
                      <span className="block text-sm font-medium transition-colors group-hover:text-ballpoint">
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] text-graphite">
                        <span>~{lesson.minutes} min</span>
                        {test?.passed ? (
                          <span className="text-ballpoint">
                            ✓ test {test.lastCorrect}/{test.lastTotal}
                          </span>
                        ) : test ? (
                          <span className="text-amber">
                            test {test.lastCorrect}/{test.lastTotal}
                          </span>
                        ) : null}
                        {prepared ? (
                          <span className="text-ballpoint">✓ prepared</span>
                        ) : examplesDone > 0 || (p && p.checklist.length > 0) ? (
                          <span>
                            {examplesDone}/{EXAMPLES_PER_CHAPTER} examples
                            {p && p.checklist.length > 0
                              ? ` · ${p.checklist.length}/${p.checklistTotal} checks`
                              : ""}
                          </span>
                        ) : p?.readAt != null ? (
                          <span>started</span>
                        ) : null}
                      </span>
                    </Link>
                    {testOut ? (
                      <Link
                        href={`/drill?test=${lesson.subtopic}`}
                        className="mt-0.5 shrink-0 rounded-control border border-ballpoint/40 px-2 py-1 font-mono text-[11px] text-ballpoint transition-colors hover:bg-ballpoint/10"
                        title="Recent drill accuracy already clears the pass bar — skip the read and prove it."
                      >
                        Test out →
                      </Link>
                    ) : (
                      <span
                        className="mt-0.5 text-graphite/50 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      >
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
