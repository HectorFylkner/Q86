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
import { requireFeature } from "@/lib/billing/entitlements";
import { chapterTestStates } from "@/lib/chapter-tests";
import { getI18n } from "@/lib/i18n/server";
import { skillLabel } from "@/lib/i18n/labels";
import { parseLesson } from "@/lib/lesson-parse";
import { listLessons, readLesson } from "@/lib/lessons";
import {
  ALL_SUBTOPICS,
  SKILL_BY_SUBTOPIC,
  type Subtopic,
} from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * The seven sections, in reading order. `id` is the anchor; the visible
 * title comes from the catalog. The `##` headings inside the markdown are
 * structural only — `lib/lesson-parse.ts` splits on them and the page
 * never renders them — which is why a Swedish chapter keeps the English
 * scaffolding and translates only the prose (ADR 0004).
 */
const SECTIONS = [
  "why",
  "ideas",
  "examples",
  "cues",
  "traps",
  "speed",
  "checklist",
] as const;

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}) {
  const { subtopic } = await params;
  if (!ALL_SUBTOPICS.includes(subtopic as Subtopic)) notFound();
  const { locale, t } = await getI18n();
  const lesson = readLesson(subtopic as Subtopic, locale);
  if (!lesson) notFound();

  const parsed = parseLesson(lesson.body);
  const { sdb } = await requireFeature("learn");
  const RAIL: RailItem[] = SECTIONS.map((id) => ({
    id,
    label: t(`learn.section.${id}Title`),
  }));
  const testState = (await chapterTestStates(sdb))[subtopic as Subtopic];
  const chapters = listLessons(locale);
  const at = chapters.findIndex((c) => c.subtopic === subtopic);
  const meta = at >= 0 ? chapters[at] : null;
  const prev = at > 0 ? chapters[at - 1] : null;
  const next = at >= 0 && at < chapters.length - 1 ? chapters[at + 1] : null;

  const header = (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
        <Link href="/learn" className="hover:text-ink">
          {t("learn.title")}
        </Link>{" "}
        · {skillLabel(t, SKILL_BY_SUBTOPIC[subtopic as Subtopic])}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold">
        {lesson.title}
      </h1>
      {lesson.fallback && (
        <p className="mt-1.5 rounded-control border border-amber/40 bg-amber/5 px-3 py-1.5 text-xs text-amber">
          {t("fallback.chapterInEnglish")}
        </p>
      )}
      {meta && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-graphite">
          <span>
            {t("learn.chapterOf", { n: at + 1, total: chapters.length })}
          </span>
          <span>
            ~{meta.minutes} {t("common.minutes")}
          </span>
          <span>{t("learn.workedExamples")}</span>
          {testState?.passed && (
            <span className="text-ballpoint">{t("learn.testPassed")}</span>
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
            {t("learn.previousChapter")}
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
            {t("learn.nextChapter")}
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

        <SectionShell id="why" index={1} title={t("learn.section.whyTitle")}>
          <WhyLede source={parsed.why} />
        </SectionShell>

        <SectionShell
          id="ideas"
          index={2}
          title={t("learn.section.ideasTitle")}
          tagline={t("learn.section.ideasTagline")}
        >
          <CoreIdeas intro={parsed.ideasIntro} ideas={parsed.ideas} />
        </SectionShell>

        <SectionShell
          id="examples"
          index={3}
          title={t("learn.section.examplesTitle")}
          tagline={t("learn.section.examplesTagline")}
        >
          <div className="space-y-3">
            {parsed.examples.map((ex, i) => (
              <ExampleCard
                key={ex.n}
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
          title={t("learn.section.cuesTitle")}
          tagline={t("learn.section.cuesTagline")}
        >
          <CueGrid
            cues={parsed.cues}
            labels={{
              see: t("lesson.whenYouSee"),
              act: t("lesson.reachFor"),
            }}
          />
        </SectionShell>

        <SectionShell
          id="traps"
          index={5}
          title={t("learn.section.trapsTitle")}
          tagline={t("learn.section.trapsTagline")}
        >
          <TrapGallery traps={parsed.traps} />
        </SectionShell>

        <SectionShell
          id="speed"
          index={6}
          title={t("learn.section.speedTitle")}
          tagline={t("learn.section.speedTagline")}
        >
          <SpeedMoves moves={parsed.speed} />
        </SectionShell>

        <SectionShell
          id="checklist"
          index={7}
          title={t("learn.section.checklistTitle")}
        >
          <DrillChecklist
            subtopic={subtopic}
            items={parsed.checklist}
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
