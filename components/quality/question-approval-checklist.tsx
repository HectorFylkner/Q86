"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  CircleNotch,
  SealCheck,
} from "@phosphor-icons/react";
import { approveQuestionCandidate } from "@/app/quality/actions";
import { cn } from "@/lib/utils";

const ATTESTATIONS = [
  {
    key: "solvedIndependently",
    label: "I solved it independently",
    detail: "My result matches the keyed answer without using the explanation.",
  },
  {
    key: "singleCorrectAnswer",
    label: "Exactly one choice is correct",
    detail: "The stem is complete, the distractors are distinct, and no second answer works.",
  },
  {
    key: "explanationAndTrapsChecked",
    label: "The teaching layer is accurate",
    detail: "Solution, fastest path, trap map, and numeric check all agree.",
  },
] as const;

type AttestationKey = (typeof ATTESTATIONS)[number]["key"];

const EMPTY_ATTESTATIONS: Record<AttestationKey, boolean> = {
  solvedIndependently: false,
  singleCorrectAnswer: false,
  explanationAndTrapsChecked: false,
};

export function QuestionApprovalChecklist({
  questionId,
}: {
  questionId: number;
}) {
  const router = useRouter();
  const [attestations, setAttestations] = useState(EMPTY_ATTESTATIONS);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const complete = Object.values(attestations).every(Boolean);

  function toggle(key: AttestationKey) {
    setAttestations((current) => ({ ...current, [key]: !current[key] }));
    setError(null);
  }

  function approve() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await approveQuestionCandidate({
          questionId,
          attestations,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setApproved(true);
        router.refresh();
      } catch {
        setError("Approval could not be saved. Check the connection and retry.");
      }
    });
  }

  if (approved) {
    return (
      <div
        className="flex items-start gap-2 border-t border-ballpoint/30 pt-4 text-sm text-ballpoint"
        role="status"
      >
        <CheckCircle size={20} weight="duotone" className="mt-0.5 shrink-0" />
        <span>Approved. This question is now eligible for training.</span>
      </div>
    );
  }

  return (
    <section
      className="space-y-4"
      aria-labelledby={`question-${questionId}-approval`}
    >
      <div>
        <div className="flex items-center gap-2">
          <SealCheck size={20} weight="duotone" className="text-ballpoint" />
          <h3
            id={`question-${questionId}-approval`}
            className="font-display text-sm font-semibold"
          >
            Human approval
          </h3>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-graphite">
          All three checks are required. Approval immediately makes the item
          available to drills and timed sets.
        </p>
      </div>

      <fieldset className="space-y-2.5" disabled={isPending}>
        <legend className="sr-only">Required attestations</legend>
        {ATTESTATIONS.map((attestation) => (
          <label
            key={attestation.key}
            className={cn(
              "grid cursor-pointer grid-cols-[18px_1fr] gap-x-2.5 rounded-control border px-3 py-2.5 transition-colors",
              attestations[attestation.key]
                ? "border-ballpoint/40 bg-ballpoint/5"
                : "border-grid bg-surface hover:border-graphite/50",
            )}
          >
            <input
              type="checkbox"
              checked={attestations[attestation.key]}
              onChange={() => toggle(attestation.key)}
              className="mt-0.5 h-4 w-4 accent-[var(--ballpoint)]"
            />
            <span>
              <span className="block text-xs font-medium text-ink">
                {attestation.label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-graphite">
                {attestation.detail}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={approve}
        disabled={!complete || isPending}
        className={cn(
          "flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-ballpoint px-4 py-2 text-sm font-semibold text-white transition-transform active:translate-y-px",
          (!complete || isPending) && "cursor-not-allowed opacity-50",
        )}
      >
        {isPending ? (
          <CircleNotch size={17} weight="bold" className="animate-spin" />
        ) : (
          <SealCheck size={17} weight="duotone" />
        )}
        {isPending ? "Approving…" : "Approve for training"}
      </button>

      {error && (
        <p className="text-xs leading-relaxed text-redpen" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
