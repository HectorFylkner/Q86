import Link from "next/link";
import { Md } from "@/components/math";
import { ConceptItemCard } from "@/components/lesson/concept-item-card";
import { SectionShell } from "@/components/lesson/sections";
import type { ConceptSegment } from "@/curriculum/v3/segments/types";
import type { ConceptRecord } from "@/curriculum/v3/types";
import { answerLabel } from "@/lib/concept-answer";

type ConceptSegmentViewProps = {
  segment: ConceptSegment;
  concept: ConceptRecord;
  prerequisites: readonly ConceptRecord[];
};

export function ConceptSegmentView({
  segment,
  concept,
  prerequisites,
}: ConceptSegmentViewProps) {
  return (
    <div className="min-w-0 space-y-9">
      <SectionShell id="objective" index={1} title="Objective + prerequisites">
        <p className="text-base leading-relaxed">{segment.objective}</p>
        {prerequisites.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {prerequisites.map((prerequisite) => (
              <Link
                key={prerequisite.id}
                href={`/learn/${prerequisite.parentSubtopic}/${encodeURIComponent(prerequisite.id)}`}
                className="rounded-control border border-grid bg-surface px-3 py-2 text-xs text-graphite transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
              >
                Review prerequisite · {prerequisite.title}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 space-y-2">
          {segment.prerequisiteChecks.map((check) => (
            <details
              key={check.id}
              className="rounded-card border border-grid bg-highlight/30 px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-medium">
                Prerequisite pulse-check
              </summary>
              <Md source={check.promptMd} className="mt-3 text-sm" />
              <div className="mt-3 border-t border-grid pt-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
                  Check yourself
                </p>
                <Md source={answerLabel(check.answer)} className="mt-1 text-sm font-medium" />
                <Md source={check.explanationMd} className="mt-2 text-sm text-graphite" />
              </div>
            </details>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="model" index={2} title="Model + formal rule">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-card border border-grid bg-surface p-4 shadow-ambient">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Intuitive model
            </p>
            <Md source={segment.intuitiveModelMd} className="mt-2 text-sm" />
          </div>
          <div className="min-w-0 rounded-card border border-grid bg-surface p-4 shadow-ambient">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Formal rule
            </p>
            <Md source={segment.formalRuleMd} className="mt-2 text-sm" />
          </div>
        </div>
      </SectionShell>

      <SectionShell id="procedure" index={3} title="Decision procedure">
        <ol className="space-y-2">
          {segment.procedure.map((step, index) => (
            <li
              key={`${concept.id}.procedure.${step}`}
              className="flex gap-3 rounded-control border border-grid bg-surface px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-ballpoint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </SectionShell>

      <SectionShell
        id="examples"
        index={4}
        title="Worked examples"
        tagline="commit before the key appears"
      >
        <div className="space-y-3">
          {segment.examples.map((example) => (
            <ConceptItemCard
              key={example.id}
              conceptId={segment.conceptId}
              contentVersion={segment.contentVersion}
              item={{
                id: example.id,
                kind: "example",
                label: example.role.replaceAll("_", " "),
                authoredDifficulty: example.authoredDifficulty,
                promptMd: example.questionMd,
                intendedMethod: example.intendedMethod,
                answerKind: example.answer.kind,
                choices:
                  example.answer.kind === "multiple_choice"
                    ? example.answer.choices
                    : [],
                hints: example.hints,
              }}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="contrast" index={5} title="Contrast pair">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-card border border-grid bg-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Case A
            </p>
            <Md source={segment.contrastPair.caseAMd} className="mt-2 text-sm" />
          </div>
          <div className="min-w-0 rounded-card border border-grid bg-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-redpen">
              Case B
            </p>
            <Md source={segment.contrastPair.caseBMd} className="mt-2 text-sm" />
          </div>
        </div>
        <Md
          source={segment.contrastPair.explanationMd}
          className="mt-3 rounded-control border border-amber/30 bg-amber/5 p-3 text-sm"
        />
      </SectionShell>

      <SectionShell id="misconceptions" index={6} title="Misconception clinic">
        <div className="grid gap-3 lg:grid-cols-3">
          {segment.misconceptions.map((misconception) => (
            <article
              key={misconception.id}
              className="min-w-0 rounded-card border border-grid bg-surface p-4 shadow-ambient"
            >
              <h3 className="text-sm font-semibold">{misconception.title}</h3>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-amber">
                Why it feels right
              </p>
              <p className="mt-1 text-sm text-graphite">
                {misconception.whyItFeelsPlausible}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-redpen">
                Detection cue
              </p>
              <p className="mt-1 text-sm text-graphite">
                {misconception.detectionCue}
              </p>
              <Md source={misconception.correctionMd} className="mt-3 text-sm" />
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="checks"
        index={7}
        title="Immediate retrieval"
        tagline="guided first, then independent"
      >
        <div className="space-y-3">
          {segment.checks.map((check) => (
            <ConceptItemCard
              key={check.id}
              conceptId={segment.conceptId}
              contentVersion={segment.contentVersion}
              item={{
                id: check.id,
                kind: "check",
                label: check.independence,
                authoredDifficulty: check.authoredDifficulty,
                promptMd: check.promptMd,
                intendedMethod: check.intendedMethod,
                answerKind: check.answer.kind,
                choices:
                  check.answer.kind === "multiple_choice"
                    ? check.answer.choices
                    : [],
                hints: check.hints,
              }}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="speed" index={8} title="Speed method + guardrail">
        <Md source={segment.speedMethod.methodMd} className="text-sm" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-card border border-ballpoint/25 bg-ballpoint/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
              Safe when
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {segment.speedMethod.safeWhen.map((condition) => (
                <li key={condition}>· {condition}</li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 rounded-card border border-redpen/25 bg-redpen/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-redpen">
              Unsafe when
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {segment.speedMethod.unsafeWhen.map((condition) => (
                <li key={condition}>· {condition}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="recap" index={9} title="Recap + delayed retrieval">
        <Md source={segment.recapMd} className="text-sm" />
        <ul className="mt-3 space-y-2">
          {segment.retrievalPrompts.map((prompt) => (
            <li
              key={prompt}
              className="rounded-control border border-grid bg-surface px-3 py-2 text-sm"
            >
              {prompt}
            </li>
          ))}
        </ul>
      </SectionShell>
    </div>
  );
}
