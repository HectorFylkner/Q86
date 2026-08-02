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
import {
  NamedTraps,
  RecognitionTable,
  TopBandCard,
} from "@/components/lesson/transfer";
import type { ChecklistTierState } from "@/components/lesson/drill-checklist";
import {
  chapterBands,
  chapterTestStates,
  tierShapeFromBands,
  tierUnlocked,
} from "@/lib/chapter-tests";
import { CHAPTER_TIERS, type ChapterTier } from "@/lib/chapter-test-config";
import { chapterTransfer } from "@/lib/chapter-transfer";
import { parseLesson } from "@/lib/lesson-parse";
import {
  isTechniqueSlug,
  listLessons,
  listTechniques,
  readLesson,
  readTechnique,
  techniqueDrillHref,
} from "@/lib/lessons";
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
  { id: "topband", label: "At the top band" },
  { id: "recognition", label: "Recognition table" },
  { id: "cues", label: "Trigger cues" },
  { id: "traps", label: "Trap gallery" },
  { id: "named", label: "Named traps" },
  { id: "speed", label: "Speed moves" },
  { id: "checklist", label: "Before you drill" },
];

/** Sections built from the question bank rather than from the markdown.
 *  A technique chapter has no subtopic, so it has none of them. */
const BANK_SECTIONS = new Set(["topband", "recognition", "named"]);

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}) {
  const { subtopic } = await params;
  const technique = isTechniqueSlug(subtopic);
  if (!technique && !ALL_SUBTOPICS.includes(subtopic as Subtopic)) notFound();

  const lesson = technique
    ? readTechnique(subtopic)
    : readLesson(subtopic as Subtopic);
  if (!lesson) notFound();

  const parsed = parseLesson(lesson.body);
  // Technique chapters have no subtopic of their own, so no bank-derived
  // transfer layer and no chapter test — they teach an approach, not a
  // slice of the taxonomy.
  const transfer = technique
    ? null
    : await chapterTransfer(subtopic as Subtopic);
  const testState = technique
    ? undefined
    : (await chapterTestStates())[subtopic as Subtopic];
  // Tier availability is a bank fact, so it is resolved on the server
  // rather than guessed in the browser: a chapter too thin for a tier
  // shows the tier as unavailable instead of offering a broken test.
  const passedTiers = Object.fromEntries(
    CHAPTER_TIERS.map((t) => [t, testState?.tiers[t]?.passed === true]),
  ) as Record<ChapterTier, boolean>;
  // One partition, read three times — the tiers are bands of a single
  // ordering, so asking for them separately is what let them overlap.
  const bands = technique ? null : await chapterBands(subtopic as Subtopic);
  const tierStates: ChecklistTierState[] = bands
    ? CHAPTER_TIERS.map((t) => {
        const state = testState?.tiers[t];
        const shape = tierShapeFromBands(bands[t], t);
        return {
          tier: t,
          passed: passedTiers[t],
          unlocked: tierUnlocked(t, passedTiers),
          available: shape.available,
          range: shape.range,
          size: shape.size,
          lastScore: state?.lastTotal
            ? `${state.lastCorrect}/${state.lastTotal}`
            : null,
        };
      })
    : [];
  // The rail is the section list, so deriving the numbering from it keeps
  // "05" in the margin and the fifth rail entry describing the same
  // section — including when a chapter's bank has no top-band item.
  const rail = RAIL.filter((item) => {
    if (!BANK_SECTIONS.has(item.id)) return true;
    if (!transfer) return false;
    return item.id !== "topband" || transfer.topBand !== null;
  });
  const n = (id: string) => rail.findIndex((item) => item.id === id) + 1;

  const techniques = listTechniques();
  const chapters = listLessons();
  const techniqueAt = technique
    ? techniques.findIndex((t) => t.slug === subtopic)
    : -1;
  const at = technique ? -1 : chapters.findIndex((c) => c.subtopic === subtopic);
  const meta = at >= 0 ? chapters[at] : null;
  const prev = technique
    ? techniqueAt > 0
      ? { subtopic: techniques[techniqueAt - 1].slug, title: techniques[techniqueAt - 1].title }
      : null
    : at > 0
      ? chapters[at - 1]
      : null;
  const next = technique
    ? techniqueAt >= 0 && techniqueAt < techniques.length - 1
      ? { subtopic: techniques[techniqueAt + 1].slug, title: techniques[techniqueAt + 1].title }
      : null
    : at >= 0 && at < chapters.length - 1
      ? chapters[at + 1]
      : null;

  const header = (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
        <Link href="/learn" className="hover:text-ink">
          Learn
        </Link>{" "}
        ·{" "}
        {technique
          ? "Technique"
          : SKILL_LABELS[SKILL_BY_SUBTOPIC[subtopic as Subtopic]]}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold">
        {lesson.title}
      </h1>
      {technique && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-graphite">
          <span>
            Technique {techniqueAt + 1} of {techniques.length}
          </span>
          <span>~{techniques[techniqueAt]?.minutes ?? 6} min</span>
          <span>3 worked examples</span>
        </p>
      )}
      {meta && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-graphite">
          <span>
            Chapter {at + 1} of {chapters.length}
          </span>
          <span>~{meta.minutes} min</span>
          <span>3 worked examples</span>
          {testState?.passed && (
            <span className="text-ballpoint">✓ test passed</span>
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

        <SectionShell id="why" index={n("why")} title="Why this matters">
          <WhyLede source={parsed.why} />
        </SectionShell>

        <SectionShell
          id="ideas"
          index={n("ideas")}
          title="The core ideas"
          tagline="the complete toolkit"
        >
          <CoreIdeas intro={parsed.ideasIntro} ideas={parsed.ideas} />
        </SectionShell>

        <SectionShell
          id="examples"
          index={n("examples")}
          title="Worked examples"
          tagline={
            technique
              ? "recognize it, then run it"
              : "easy → exam-hard, try before revealing"
          }
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

        {transfer?.topBand && (
          <SectionShell
            id="topband"
            index={n("topband")}
            title="At the top band"
            tagline={`the hardest D${transfer.topBand.difficulty} item in this chapter's bank`}
          >
            <TopBandCard example={transfer.topBand} />
          </SectionShell>
        )}

        {transfer && (
          <SectionShell
            id="recognition"
            index={n("recognition")}
            title="Recognition table"
            tagline={`${transfer.recognition.length} stem cues from the ${transfer.coverage.total} bank items behind this chapter`}
          >
            <RecognitionTable rows={transfer.recognition} />
          </SectionShell>
        )}

        <SectionShell
          id="cues"
          index={n("cues")}
          title="Trigger cues"
          tagline="phrase → method, memorize these"
        >
          <CueGrid cues={parsed.cues} />
        </SectionShell>

        <SectionShell
          id="traps"
          index={n("traps")}
          title="Trap gallery"
          tagline="the classic wrong turns"
        >
          <TrapGallery traps={parsed.traps} />
        </SectionShell>

        {transfer && (
          <SectionShell
            id="named"
            index={n("named")}
            title="Named traps"
            tagline="the post-mortem's exact words"
          >
            <NamedTraps traps={transfer.traps} />
          </SectionShell>
        )}

        <SectionShell
          id="speed"
          index={n("speed")}
          title="Speed moves"
          tagline="legitimate shortcuts"
        >
          <SpeedMoves moves={parsed.speed} />
        </SectionShell>

        <SectionShell
          id="checklist"
          index={n("checklist")}
          title="Before you drill"
        >
          <DrillChecklist
            subtopic={subtopic}
            items={parsed.checklist}
            drill={
              technique
                ? techniqueDrillHref(subtopic)
                : { href: `/drill?sub=${subtopic}&d=3`, label: "Drill this now →" }
            }
            test={
              technique
                ? undefined
                : { passed: testState?.passed ?? false, tiers: tierStates }
            }
          />
        </SectionShell>

        {footer}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <LessonRail items={rail} />
        </div>
      </aside>
    </div>
  );
}
