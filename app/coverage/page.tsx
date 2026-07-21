import Link from "next/link";
import { StatusPill } from "@/components/coverage/status-pill";
import { SummaryMetric } from "@/components/coverage/summary-metric";
import { buildCoverageLedger } from "@/curriculum/v3/coverage";
import { buildCurriculumV3 } from "@/curriculum/v3/graph";
import { PILOT_SUBTOPICS } from "@/curriculum/v3/pilot-concepts";
import { SUBTOPIC_LABELS, type Subtopic } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function CoveragePage() {
  const curriculum = buildCurriculumV3();
  const ledger = buildCoverageLedger(curriculum);
  const conceptById = new Map(
    curriculum.concepts.map((concept) => [concept.id, concept]),
  );
  const lessonReady = ledger.concepts.filter(
    (cell) => cell.lessonStatus === "production_ready",
  ).length;
  const mappedQuestions = ledger.questionMappings.filter(
    (mapping) => mapping.status === "mapped",
  ).length;
  const grouped = new Map<string, typeof ledger.concepts>();
  for (const cell of ledger.concepts) {
    const parent =
      conceptById.get(cell.conceptId)?.parentSubtopic ?? "unknown";
    grouped.set(parent, [...(grouped.get(parent) ?? []), cell]);
  }

  return (
    <div className="space-y-6">
      <header className="max-w-4xl">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ballpoint">
          Curriculum v3 · evidence ledger
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Coverage without the victory lap
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          Every concept can be located. Only aligned, stable, independently scored evidence can open an assessment. Missing work stays visible instead of being averaged into a broad chapter score.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-5" aria-label="Coverage summary">
        <SummaryMetric
          label="Concept records"
          value={String(ledger.concepts.length)}
          detail={`${curriculum.coreIdeaInventory.length} ideas dispositioned`}
        />
        <SummaryMetric
          label="Complete segments"
          value={String(lessonReady)}
          detail="teaching contract met"
        />
        <SummaryMetric
          label="Leaf-mapped questions"
          value={String(mappedQuestions)}
          detail="curated pilot mappings"
        />
        <SummaryMetric
          label="Unresolved questions"
          value={String(ledger.unresolvedQuestionIds.length)}
          detail="explicit, not orphaned"
        />
        <SummaryMetric
          label="Assessment-eligible"
          value={String(
            ledger.concepts.filter((cell) => cell.assessmentEligible).length,
          )}
          detail="proof floors enforced"
        />
      </section>

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Teaching gate
            </p>
            <p className="mt-1 text-sm text-graphite">
              3 worked examples, 6 graded checks, 3 named misconceptions.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Assessment gate
            </p>
            <p className="mt-1 text-sm text-graphite">
              6 replayably verified items, 3 bands, 2 surface forms—and more when the blueprint consumes more.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Current exam boundary
            </p>
            <p className="mt-1 text-sm text-graphite">
              Quant uses Problem Solving. Data Sufficiency is tracked as the quantitative Data Insights bridge.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Vertical pilots</h2>
          <p className="text-xs text-graphite">
            These 43 leaves are curated most deeply; the ledger still closes every unsupported test.
          </p>
        </div>
        {PILOT_SUBTOPICS.map((subtopic) => {
          const cells = grouped.get(subtopic) ?? [];
          return (
            <div
              key={subtopic}
              className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-grid px-4 py-3 sm:px-5">
                <h3 className="font-display text-sm font-semibold">
                  {SUBTOPIC_LABELS[subtopic]}
                </h3>
                <span className="font-mono text-[10px] text-graphite">
                  {cells.filter((cell) => cell.lessonStatus === "production_ready").length}/{cells.length} complete segments
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-grid font-mono text-[10px] uppercase tracking-wide text-graphite">
                      <th className="px-4 py-2 font-normal sm:px-5">Concept</th>
                      <th className="px-3 py-2 font-normal">Teach</th>
                      <th className="px-3 py-2 font-normal">Examples / checks / traps</th>
                      <th className="px-3 py-2 font-normal">Scored raw / proof</th>
                      <th className="px-3 py-2 font-normal">Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cells.map((cell) => {
                      const concept = conceptById.get(cell.conceptId)!;
                      return (
                        <tr key={cell.conceptId} className="border-b border-grid last:border-0">
                          <td className="px-4 py-3 sm:px-5">
                            <Link
                              href={`/learn/${concept.parentSubtopic}/${encodeURIComponent(concept.id)}`}
                              className="font-medium hover:text-ballpoint hover:underline"
                            >
                              {concept.title}
                            </Link>
                            <p className="mt-0.5 max-w-xl text-xs text-graphite">
                              {concept.objective}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <StatusPill ready={cell.lessonStatus === "production_ready"} />
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">
                            {cell.exampleIds.length} / {cell.gradedCheckIds.length} / {cell.misconceptionIds.length}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">
                            {cell.rawScoredQuestionIds.length} / {cell.replayablyVerifiedQuestionIds.length}
                          </td>
                          <td className="px-3 py-3">
                            <StatusPill ready={cell.assessmentEligible} />
                            {!cell.assessmentEligible && (
                              <p className="mt-1 max-w-[240px] text-[11px] leading-snug text-graphite">
                                {cell.shortfalls.slice(0, 2).join(" · ")}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-2">
        <div>
          <h2 className="font-display text-lg font-semibold">Complete inventory</h2>
          <p className="text-xs text-graphite">
            Every current lesson idea has a canonical concept or an explicit merge; non-pilot leaves remain unpublished until curated.
          </p>
        </div>
        {[...grouped.entries()]
          .filter(([parent]) => !PILOT_SUBTOPICS.includes(parent as (typeof PILOT_SUBTOPICS)[number]))
          .map(([parent, cells]) => {
            const parentLabel =
              parent in SUBTOPIC_LABELS
                ? SUBTOPIC_LABELS[parent as Subtopic]
                : parent.replaceAll("_", " ");
            return (
              <details
                key={parent}
                className="rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient"
              >
                <summary className="cursor-pointer text-sm font-medium">
                  {parentLabel}{" "}
                  <span className="font-mono text-[10px] font-normal text-graphite">
                    {cells.length} concept records
                  </span>
                </summary>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {cells.map((cell) => {
                    const concept = conceptById.get(cell.conceptId)!;
                    return (
                      <li key={cell.conceptId}>
                        <Link
                          href={`/learn/${concept.parentSubtopic}/${encodeURIComponent(concept.id)}`}
                          className="block rounded-control border border-grid bg-highlight/20 px-3 py-2 text-sm transition-colors hover:border-ballpoint/40"
                        >
                          <span>{concept.title}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-amber">
                            unpublished · {cell.shortfalls.length} evidence gaps
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
      </section>
    </div>
  );
}
