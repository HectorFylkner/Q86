import Link from "next/link";
import { notFound } from "next/navigation";
import { ConceptSegmentView } from "@/components/lesson/concept-segment";
import { buildCoverageLedger } from "@/curriculum/v3/coverage";
import { buildCurriculumV3 } from "@/curriculum/v3/graph";
import { segmentByConceptId } from "@/curriculum/v3/segments";
import { conceptLearningEvidence } from "@/lib/concept-learning";
import { SUBTOPIC_LABELS, type Subtopic } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function decodedParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ConceptLessonPage({
  params,
}: {
  params: Promise<{ subtopic: string; conceptId: string }>;
}) {
  const route = await params;
  const conceptId = decodedParam(route.conceptId);
  const curriculum = buildCurriculumV3();
  const concept = curriculum.concepts.find((item) => item.id === conceptId);
  if (!concept || concept.parentSubtopic !== route.subtopic) notFound();

  const ledger = buildCoverageLedger(curriculum);
  const coverage = ledger.concepts.find((item) => item.conceptId === concept.id);
  if (!coverage) notFound();
  const segment = segmentByConceptId(concept.id);
  const prerequisites = concept.prerequisiteConceptIds
    .map((id) => curriculum.concepts.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => item != null);
  const evidence = segment
    ? await conceptLearningEvidence(concept.id)
    : {
        attempts: 0,
        independentInitialCorrect: 0,
        hintedAttempts: 0,
        declaredUnknown: 0,
        openRemediations: 0,
        latestAttemptAt: null,
      };
  const parentLabel =
    concept.parentSubtopic in SUBTOPIC_LABELS
      ? SUBTOPIC_LABELS[concept.parentSubtopic as Subtopic]
      : concept.parentSubtopic.replaceAll("_", " ");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
          <Link href="/learn" className="hover:text-ballpoint">
            Learn
          </Link>{" "}
          ·{" "}
          <Link
            href={`/learn/${concept.parentSubtopic}`}
            className="hover:text-ballpoint"
          >
            {parentLabel}
          </Link>
          {" · concept leaf"}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {concept.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-graphite">
              {concept.objective}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide ${
              segment
                ? "border-ballpoint/35 bg-ballpoint/5 text-ballpoint"
                : "border-amber/40 bg-amber/5 text-amber"
            }`}
          >
            {segment ? "teaching complete" : "unpublished segment"}
          </span>
        </div>
        <p className="mt-2 font-mono text-[10px] text-faint">
          {concept.id} · content {concept.contentVersion}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Concept evidence status">
        <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
            Lesson evidence
          </p>
          <p className="mt-2 text-lg font-semibold">
            {segment ? `${coverage.exampleIds.length} + ${coverage.gradedCheckIds.length}` : "Not complete"}
          </p>
          <p className="text-xs text-graphite">
            {segment ? "worked examples + graded checks" : "source chapter only"}
          </p>
        </div>
        <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
            Independent checks
          </p>
          <p className="mt-2 text-lg font-semibold">
            {evidence.independentInitialCorrect}/{evidence.attempts}
          </p>
          <p className="text-xs text-graphite">initially correct, no hints</p>
        </div>
        <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
            Open actions
          </p>
          <p className="mt-2 text-lg font-semibold">{evidence.openRemediations}</p>
          <p className="text-xs text-graphite">targeted retries or reviews</p>
        </div>
        <div className="rounded-card border border-amber/35 bg-amber/5 p-4 shadow-ambient">
          <p className="font-mono text-[10px] uppercase tracking-wide text-amber">
            Assessment
          </p>
          <p className="mt-2 text-lg font-semibold">Unavailable</p>
          <p className="text-xs text-graphite">
            {coverage.replayablyVerifiedQuestionIds.length}/{coverage.scoredItemRequirement} replayably verified items
          </p>
        </div>
      </section>

      <nav
        aria-label="Concept actions"
        className="flex flex-wrap items-center gap-2 rounded-card border border-grid bg-surface p-3 shadow-ambient"
      >
        <Link
          href={`/learn/${concept.parentSubtopic}`}
          className="rounded-control border border-grid px-4 py-2 text-sm text-graphite hover:border-ballpoint/50 hover:text-ballpoint"
        >
          Chapter overview
        </Link>
        {coverage.rawScoredQuestionIds.length > 0 ? (
          <Link
            href={`/drill?concept=${encodeURIComponent(concept.id)}&n=${Math.min(6, coverage.rawScoredQuestionIds.length)}`}
            className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
          >
            Practice this exact concept · {coverage.rawScoredQuestionIds.length} available
          </Link>
        ) : (
          <span className="rounded-control border border-amber/35 bg-amber/5 px-4 py-2 text-sm text-amber">
            Targeted practice closed · 0 mapped items
          </span>
        )}
      </nav>

      {!segment ? (
        <section className="space-y-5 rounded-card border border-amber/35 bg-surface p-5 shadow-ambient sm:p-7">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-amber">
              Honest publication gate
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              This concept is inventoried, not yet taught as a complete segment.
            </h2>
            <p className="mt-2 text-sm text-graphite">
              The existing chapter remains available. Q86 will not call this leaf prepared or mastered until its aligned teaching and assessment evidence exists.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Exact shortfalls</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {coverage.shortfalls.map((shortfall) => (
                <li
                  key={shortfall}
                  className="rounded-control border border-grid bg-highlight/30 px-3 py-2 text-sm text-graphite"
                >
                  {shortfall}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Boundaries</h3>
              <ul className="mt-2 space-y-1 text-sm text-graphite">
                {concept.boundaries.map((boundary) => (
                  <li key={boundary}>· {boundary}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Decision cues</h3>
              <ul className="mt-2 space-y-1 text-sm text-graphite">
                {concept.methods.flatMap((method) => method.decisionCues).map((cue) => (
                  <li key={cue}>· {cue}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/learn/${concept.parentSubtopic}`}
              className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white"
            >
              Read the parent chapter
            </Link>
            <Link
              href="/coverage"
              className="rounded-control border border-grid px-4 py-2 text-sm text-graphite hover:border-ballpoint/50"
            >
              Inspect the coverage ledger
            </Link>
          </div>
        </section>
      ) : (
        <ConceptSegmentView
          segment={segment}
          concept={concept}
          prerequisites={prerequisites}
        />
      )}

      {coverage.shortfalls.length > 0 && segment && (
        <aside className="rounded-card border border-amber/35 bg-amber/5 p-4">
          <h2 className="text-sm font-semibold">Why certification is still closed</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {coverage.shortfalls.map((shortfall) => (
              <li
                key={shortfall}
                className="rounded-full border border-amber/30 bg-surface px-2.5 py-1 text-xs text-graphite"
              >
                {shortfall}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
