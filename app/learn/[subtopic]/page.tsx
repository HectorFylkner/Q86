import Link from "next/link";
import { notFound } from "next/navigation";
import { Md } from "@/components/math";
import { DrillChecklist } from "@/components/lesson/drill-checklist";
import { ExampleCard } from "@/components/lesson/example-card";
import {
  LessonRail,
  ReadingProgress,
  type RailItem,
} from "@/components/lesson/lesson-rail";
import {
  CoreIdeas,
  CueGrid,
  SectionShell,
  SpeedMoves,
  TrapGallery,
  WhyLede,
} from "@/components/lesson/sections";
import { MarkLessonRead } from "@/components/lesson/learn-progress";
import { chapterTestStates } from "@/lib/chapter-tests";
import { parseLesson } from "@/lib/lesson-parse";
import { lessonProgressBySubtopic } from "@/lib/lesson-progress";
import { listLessons, readLesson } from "@/lib/lessons";
import {
  ALL_SUBTOPICS,
  SKILL_BY_SUBTOPIC,
  SKILL_LABELS,
  type Subtopic,
} from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAIL: RailItem[] = [
  { id: "why", label: "Why this matters" },
  { id: "ideas", label: "The core ideas" },
  { id: "examples", label: "Worked examples" },
  { id: "cues", label: "Trigger cues" },
  { id: "traps", label: "Trap gallery" },
  { id: "speed", label: "Speed moves" },
  { id: "checklist", label: "Before you drill" },
];

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}) {
  const { subtopic } = await params;
  if (!ALL_SUBTOPICS.includes(subtopic as Subtopic)) notFound();
  const lesson = readLesson(subtopic as Subtopic);
  if (!lesson) notFound();

  const parsed = parseLesson(lesson.body);
  const testState = (await chapterTestStates())[subtopic as Subtopic];
  const progress = (await lessonProgressBySubtopic()).get(
    subtopic as Subtopic,
  );
  const chapters = listLessons();
  const at = chapters.findIndex((c) => c.subtopic === subtopic);
  const meta = at >= 0 ? chapters[at] : null;
  const prev = at > 0 ? chapters[at - 1] : null;
  const next = at >= 0 && at < chapters.length - 1 ? chapters[at + 1] : null;

  const header = (
    <div>
      <MarkLessonRead
        subtopic={subtopic as Subtopic}
        alreadyRead={progress?.readAt != null}
      />
      <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
        <Link href="/learn" className="hover:text-ink">
          Learn
        </Link>{" "}
        · {SKILL_LABELS[SKILL_BY_SUBTOPIC[subtopic as Subtopic]]}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold">
        {lesson.title}
      </h1>
      {meta && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-graphite">
          <span>
            Chapter {at + 1} of {chapters.length}
          </span>
          <span>~{meta.minutes} min</span>
          {parsed && (
            <span>
              {parsed.examples.length} worked example
              {parsed.examples.length === 1 ? "" : "s"}
            </span>
          )}
          {testState?.passed && (
            <span className="text-ballpoint">
              ✓ test passed · last {testState.lastCorrect}/
              {testState.lastTotal}
            </span>
          )}
        </p>
      )}
    </div>
  );

  const footer = (prev || next) && (
    <div className="grid gap-2 border-t border-grid pt-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/learn/${prev.subtopic}`}
          className="group rounded-card border border-grid bg-surface p-4 shadow-ambient transition-colors hover:border-ballpoint/50 sm:px-5"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">
            ← Previous chapter
          </span>
          <span className="mt-1 block text-sm font-medium group-hover:text-ballpoint">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={`/learn/${next.subtopic}`}
          className="group rounded-card border border-grid bg-surface p-4 text-right shadow-ambient transition-colors hover:border-ballpoint/50 sm:px-5"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">
            Next chapter →
          </span>
          <span className="mt-1 block text-sm font-medium group-hover:text-ballpoint">
            {next.title}
          </span>
        </Link>
      )}
    </div>
  );

  // A chapter that ever deviates from the template still renders in full
  // through the generic markdown path.
  if (!parsed) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {header}
        <article className="rounded-card border border-grid bg-surface p-6 shadow-ambient sm:p-8">
          <Md source={lesson.body} className="text-[15px]" />
        </article>
        {footer}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_190px] lg:gap-10">
      <ReadingProgress />
      <div className="min-w-0 space-y-9 lg:max-w-3xl">
        {header}

        <SectionShell id="why" index={1} title="Why this matters">
          <WhyLede source={parsed.why} />
        </SectionShell>

        <SectionShell
          id="ideas"
          index={2}
          title="The core ideas"
          tagline="the complete toolkit"
        >
          <CoreIdeas intro={parsed.ideasIntro} ideas={parsed.ideas} />
        </SectionShell>

        <SectionShell
          id="examples"
          index={3}
          title="Worked examples"
          tagline="easy → exam-hard, try before revealing"
        >
          <div className="space-y-3">
            {parsed.examples.map((ex, i) => (
              <ExampleCard
                key={ex.n}
                subtopic={subtopic as Subtopic}
                n={ex.n}
                level={Math.min(i, 2) as 0 | 1 | 2}
                question={ex.question}
                work={ex.work}
                answer={ex.answer}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="cues"
          index={4}
          title="Trigger cues"
          tagline="phrase → method, memorize these"
        >
          <CueGrid cues={parsed.cues} />
        </SectionShell>

        <SectionShell
          id="traps"
          index={5}
          title="Trap gallery"
          tagline="the classic wrong turns"
        >
          <TrapGallery traps={parsed.traps} />
        </SectionShell>

        <SectionShell
          id="speed"
          index={6}
          title="Speed moves"
          tagline="legitimate shortcuts"
        >
          <SpeedMoves moves={parsed.speed} />
        </SectionShell>

        <SectionShell id="checklist" index={7} title="Before you drill">
          <DrillChecklist
            subtopic={subtopic}
            items={parsed.checklist}
            initialChecked={progress?.checklist ?? []}
            serverHasRow={progress != null}
            test={{
              passed: testState?.passed ?? false,
              lastScore: testState
                ? `${testState.lastCorrect}/${testState.lastTotal}`
                : null,
            }}
          />
        </SectionShell>

        {footer}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <LessonRail items={RAIL} />
        </div>
      </aside>
    </div>
  );
}
