import Link from "next/link";
import { LearnPrepared, ReadBadge } from "@/components/lesson/learn-progress";
import {
  chapterTestStates,
  type ChapterTestState,
} from "@/lib/chapter-tests";
import { CHAPTER_TIERS, TIER_SPEC } from "@/lib/chapter-test-config";
import { listLessons, listTechniques } from "@/lib/lessons";
import { FUNDAMENTAL_SKILLS, SKILL_LABELS } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const METHOD = [
  { step: "Read", detail: "the core ideas and cues" },
  { step: "Attempt", detail: "each example before revealing" },
  { step: "Tick", detail: "the pre-drill checklist honestly" },
  { step: "Drill", detail: "the same subtopic while it's warm" },
];

/** Which rung of the ladder this chapter stands on. Names the tier rather
 *  than showing a bare score, because "5/6 on the foundation tier" and
 *  "5/6 on the top band" mean opposite things. */
function TierBadge({ state }: { state?: ChapterTestState }) {
  if (!state) return null;
  const cleared = CHAPTER_TIERS.filter((t) => state.tiers[t]?.passed);
  if (cleared.length === CHAPTER_TIERS.length) {
    return <span className="text-ballpoint">✓ all tiers</span>;
  }
  if (state.passed) {
    return <span className="text-ballpoint">✓ passed</span>;
  }
  if (cleared.length > 0) {
    const top = cleared[cleared.length - 1];
    return (
      <span className="text-ballpoint">
        ✓ {TIER_SPEC[top].label.toLowerCase()}
      </span>
    );
  }
  const attempted = CHAPTER_TIERS.map((t) => state.tiers[t]).find(Boolean);
  if (attempted?.lastTotal) {
    return (
      <span className="text-amber">
        foundation {attempted.lastCorrect}/{attempted.lastTotal}
      </span>
    );
  }
  return null;
}

export default async function LearnPage() {
  const lessons = listLessons();
  const techniques = listTechniques();
  const tests = await chapterTestStates();
  const passedCount = lessons.filter((l) => tests[l.subtopic]?.passed).length;
  let chapterNo = 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-xl font-semibold">Learn</h1>
          <p className="text-xs text-graphite">
            {techniques.length} technique chapters and {lessons.length} concept
            chapters, one per drillable subtopic
            {passedCount > 0 &&
              ` — ${passedCount} test${passedCount === 1 ? "" : "s"} passed`}
            .
          </p>
        </div>
        <div className="mt-1">
          <LearnPrepared
            subtopics={[
              ...techniques.map((t) => t.slug),
              ...lessons.map((l) => l.subtopic),
            ]}
          />
        </div>
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

      {lessons.length === 0 && techniques.length === 0 && (
        <p className="rounded-card border border-grid bg-surface p-6 text-sm text-graphite shadow-ambient">
          Chapters are being written — check back shortly.
        </p>
      )}

      {/* Technique before content. The subtopic chapters teach what a
          question is about; these teach what to do with it, and reading
          them first is what stops the algebra reflex from setting. */}
      {techniques.length > 0 && (
        <section>
          <div className="mb-2 flex items-baseline gap-2">
            <h2 className="font-display text-sm font-semibold">Technique</h2>
            <span className="font-mono text-[11px] text-graphite">
              read these first
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {techniques.map((technique, i) => (
              <Link
                key={technique.slug}
                href={`/learn/${technique.slug}`}
                className="group flex items-start gap-3 rounded-card border border-grid border-l-2 border-l-ballpoint/60 bg-surface px-4 py-3 shadow-ambient transition-colors hover:border-ballpoint/50 hover:bg-highlight/40"
              >
                <span className="mt-0.5 font-mono text-[11px] text-ballpoint">
                  T{i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium transition-colors group-hover:text-ballpoint">
                    {technique.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] text-graphite">
                    <span>~{technique.minutes} min</span>
                    <ReadBadge subtopic={technique.slug} />
                  </span>
                </span>
                <span
                  className="mt-0.5 text-graphite/50 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {FUNDAMENTAL_SKILLS.map((skill) => {
        const group = lessons.filter((l) => l.skill === skill);
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
                        <span>~{lesson.minutes} min</span>
                        <TierBadge state={tests[lesson.subtopic]} />
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
