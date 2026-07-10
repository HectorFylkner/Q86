import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { SSR } from "@phosphor-icons/react";
import { Md } from "@/components/math";
import { QuestionApprovalChecklist } from "@/components/quality/question-approval-checklist";
import { SectionTabs } from "@/components/section-tabs";
import type { Question } from "@/lib/db/schema";
import { quarantinedQuestionCandidates } from "@/lib/quality";
import {
  FORMAT_LABELS,
  SKILL_SHORT_LABELS,
  SUBTOPIC_LABELS,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Question QA · Q86",
  description: "Review quarantined model-generated question candidates.",
};

function choiceLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function CandidateReview({
  candidate,
  position,
}: {
  candidate: Question;
  position: number;
}) {
  const SourceIcon = candidate.source === "twin" ? SSR.GitFork : SSR.Flask;
  const traps = Object.entries(candidate.trapMap).sort(
    ([left], [right]) => Number(left) - Number(right),
  );

  return (
    <article className="grid gap-8 py-9 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
      <div className="min-w-0 space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-grid bg-highlight font-mono text-xs font-semibold">
              {String(position).padStart(2, "0")}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-highlight px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber">
                  <SourceIcon size={13} weight="duotone" />
                  {candidate.source === "twin" ? "Twin candidate" : "Generated candidate"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-graphite">
                  Q{candidate.id}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-graphite">
                {SKILL_SHORT_LABELS[candidate.fundamentalSkill]} · {SUBTOPIC_LABELS[candidate.subtopic]} · D{candidate.difficulty} · {FORMAT_LABELS[candidate.format]}
              </p>
            </div>
          </div>
          <time
            dateTime={candidate.createdAt.toISOString()}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-graphite"
          >
            {format(candidate.createdAt, "MMM d, yyyy · HH:mm")}
          </time>
        </header>

        <section aria-labelledby={`question-${candidate.id}-stem`}>
          <p
            id={`question-${candidate.id}-stem`}
            className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite"
          >
            Stem
          </p>
          <div className="text-[16px]">
            <Md source={candidate.stemMd} />
          </div>
        </section>

        <section aria-labelledby={`question-${candidate.id}-choices`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p
              id={`question-${candidate.id}-choices`}
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite"
            >
              Choices
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ballpoint">
              <SSR.Scales size={15} weight="duotone" />
              Keyed answer {choiceLetter(candidate.correctIndex)}
            </span>
          </div>
          <ol className="space-y-2">
            {candidate.choices.map((choice, index) => {
              const correct = index === candidate.correctIndex;
              return (
                <li
                  key={`${candidate.id}-choice-${index}`}
                  className={cn(
                    "grid grid-cols-[2rem_1fr] gap-3 rounded-control border px-3 py-2.5",
                    correct
                      ? "border-ballpoint/50 bg-ballpoint/5"
                      : "border-grid bg-surface",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border font-mono text-xs",
                      correct
                        ? "border-ballpoint bg-ballpoint text-white"
                        : "border-grid text-graphite",
                    )}
                  >
                    {choiceLetter(index)}
                  </span>
                  <Md source={choice} className="self-center text-sm leading-normal" />
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid gap-6 border-t border-grid pt-6 md:grid-cols-2">
          <section aria-labelledby={`question-${candidate.id}-solution`}>
            <p
              id={`question-${candidate.id}-solution`}
              className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite"
            >
              Full solution
            </p>
            <Md source={candidate.solutionMd} className="text-sm" />
          </section>
          <section aria-labelledby={`question-${candidate.id}-fastest`}>
            <p
              id={`question-${candidate.id}-fastest`}
              className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite"
            >
              Fastest path
            </p>
            <Md source={candidate.fastestPathMd} className="text-sm" />
          </section>
        </div>

        <section
          className="border-t border-grid pt-6"
          aria-labelledby={`question-${candidate.id}-traps`}
        >
          <p
            id={`question-${candidate.id}-traps`}
            className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite"
          >
            Trap map
          </p>
          <div className="divide-y divide-grid border-y border-grid">
            {traps.map(([index, trap]) => (
              <div
                key={`${candidate.id}-trap-${index}`}
                className="grid gap-1 py-2.5 text-sm sm:grid-cols-[5rem_1fr] sm:gap-4"
              >
                <span className="font-mono text-xs text-graphite">
                  Choice {choiceLetter(Number(index))}
                </span>
                <span>{trap}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-grid pt-5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite">
            Numeric check
          </span>
          {candidate.numericCheck ? (
            <code className="rounded-control bg-highlight px-2 py-1 font-mono text-xs text-ink">
              {candidate.numericCheck}
            </code>
          ) : (
            <span className="text-xs text-graphite">Not applicable</span>
          )}
          {candidate.twinOf != null && (
            <span className="ml-auto font-mono text-[10px] text-graphite">
              Twin of Q{candidate.twinOf}
            </span>
          )}
        </section>
      </div>

      <aside className="self-start border-t border-grid pt-5 lg:sticky lg:top-20">
        <QuestionApprovalChecklist questionId={candidate.id} />
      </aside>
    </article>
  );
}

export default async function QualityPage() {
  const candidates = await quarantinedQuestionCandidates();

  return (
    <div className="space-y-7">
      <SectionTabs group="progress" />

      <header className="grid gap-6 border-b border-grid pb-7 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber/40 bg-highlight px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-amber">
            <SSR.ShieldWarning size={15} weight="duotone" />
            Model checked · not training ready
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Question QA
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite">
            A second model agreed with each key, but that gate has admitted bad
            mathematics before. Solve every candidate yourself and inspect its
            teaching layer before promotion.
          </p>
        </div>
        <div className="border-l-2 border-ballpoint pl-4">
          <p className="font-mono text-3xl font-semibold leading-none">
            {candidates.length}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-graphite">
            {candidates.length === 1 ? "candidate awaits" : "candidates await"} an explicit human decision
          </p>
        </div>
      </header>

      {candidates.length === 0 ? (
        <section className="grid gap-5 border-y border-grid py-10 md:grid-cols-[auto_1fr_auto] md:items-center">
          <SSR.CheckCircle
            size={42}
            weight="duotone"
            className="text-ballpoint"
          />
          <div>
            <h2 className="font-display text-lg font-semibold">
              The quarantine is clear
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-graphite">
              No model-generated candidates are waiting. Generate targeted
              questions from Drill or create twins from a post-mortem.
            </p>
          </div>
          <Link
            href="/drill"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-ballpoint px-4 py-2 text-sm font-semibold text-ballpoint transition-transform active:translate-y-px"
          >
            Open Drill
            <SSR.ArrowRight size={16} weight="bold" />
          </Link>
        </section>
      ) : (
        <section aria-label="Quarantined question candidates" className="divide-y divide-grid">
          {candidates.map((candidate, index) => (
            <CandidateReview
              key={candidate.id}
              candidate={candidate}
              position={index + 1}
            />
          ))}
        </section>
      )}
    </div>
  );
}
