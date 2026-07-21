import Link from "next/link";
import type { EvidenceStatus } from "@/curriculum/v3/types";

export type ConceptChildSummary = {
  id: string;
  parentSubtopic: string;
  title: string;
  objective: string;
  lessonStatus: EvidenceStatus;
  assessmentEligible: boolean;
  shortfallCount: number;
};

export function ConceptChildList({
  concepts,
}: {
  concepts: readonly ConceptChildSummary[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {concepts.map((concept) => {
        const teachingComplete = concept.lessonStatus === "production_ready";
        return (
          <Link
            key={concept.id}
            href={`/learn/${concept.parentSubtopic}/${encodeURIComponent(concept.id)}`}
            className="group rounded-card border border-grid bg-surface p-4 shadow-ambient transition-colors hover:border-ballpoint/50"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold group-hover:text-ballpoint">
                {concept.title}
              </span>
              <span
                className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-wide ${
                  teachingComplete
                    ? "border-ballpoint/30 bg-ballpoint/5 text-ballpoint"
                    : "border-amber/35 bg-amber/5 text-amber"
                }`}
              >
                {teachingComplete ? "segment ready" : "unpublished"}
              </span>
            </span>
            <span className="mt-2 block text-xs leading-relaxed text-graphite">
              {concept.objective}
            </span>
            <span className="mt-2 block font-mono text-[10px] text-faint">
              {concept.assessmentEligible
                ? "assessment eligible"
                : `${concept.shortfallCount} evidence gap${concept.shortfallCount === 1 ? "" : "s"} · assessment closed`}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
