"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { ChoiceList } from "@/components/drill/choice-list";
import { ScratchCapture } from "@/components/postmortem/capture";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorBanner } from "@/components/ui/error-banner";
import { tagAttempt } from "@/lib/actions";
import type { CoachResponse } from "@/lib/ai/schemas";
import type { Attempt, Question } from "@/lib/db/schema";
import {
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  ALL_SUBTOPICS,
  SUBTOPIC_LABELS,
  SKILL_LABELS,
  CONFIDENCE_LABELS,
  type ErrorType,
  type Subtopic,
} from "@/lib/taxonomy";
import { cn, formatSeconds } from "@/lib/utils";

const COACH_STAGES = [
  "Reading the whiteboard…",
  "Classifying the miss…",
  "Writing the prescription…",
];

type CoachState =
  | { kind: "idle" }
  | { kind: "running"; stageIndex: number }
  | { kind: "done"; coach: CoachResponse }
  | { kind: "error"; message: string };

type TwinState =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; ids: number[]; verified: number; failed: number }
  | { kind: "error"; message: string };

export function PostmortemClient({
  attempt,
  question,
}: {
  attempt: Attempt;
  question: Question;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [coachState, setCoachState] = useState<CoachState>({ kind: "idle" });
  const [twinState, setTwinState] = useState<TwinState>({ kind: "idle" });
  const [errorType, setErrorType] = useState<ErrorType | null>(
    attempt.errorType ?? null,
  );
  const [errorSubtag, setErrorSubtag] = useState<Subtopic | null>(
    attempt.errorSubtag ?? null,
  );
  const [notes, setNotes] = useState(attempt.userNotes ?? "");
  const [confirmState, setConfirmState] = useState<
    "unsaved" | "saving" | "saved" | "error"
  >("unsaved");

  // Cycle the loading stage text.
  useEffect(() => {
    if (coachState.kind !== "running") return;
    const t = setInterval(() => {
      setCoachState((s) =>
        s.kind === "running"
          ? { kind: "running", stageIndex: (s.stageIndex + 1) % COACH_STAGES.length }
          : s,
      );
    }, 6000);
    return () => clearInterval(t);
  }, [coachState.kind]);

  async function runCoach() {
    setCoachState({ kind: "running", stageIndex: 0 });
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, images }),
      });
      const body = (await res.json()) as {
        coach?: CoachResponse;
        error?: string;
      };
      if (!res.ok || !body.coach) {
        throw new Error(body.error ?? `Coach failed with status ${res.status}.`);
      }
      setCoachState({ kind: "done", coach: body.coach });
      // AI-suggested classification — the user confirms or overrides below.
      setErrorType(body.coach.error_type);
      setErrorSubtag(body.coach.error_subtag);
      setConfirmState("unsaved");
    } catch (e) {
      setCoachState({
        kind: "error",
        message:
          e instanceof Error
            ? e.message
            : "The coach call failed. Check ANTHROPIC_API_KEY and retry.",
      });
    }
  }

  async function queueTwins() {
    setTwinState({ kind: "working" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinOf: question.id, count: 2 }),
      });
      const body = (await res.json()) as {
        questionIds?: number[];
        verified?: number;
        failed?: number;
        error?: string;
      };
      if (!res.ok || body.questionIds == null) {
        throw new Error(body.error ?? `Twin generation failed (${res.status}).`);
      }
      setTwinState({
        kind: "done",
        ids: body.questionIds,
        verified: body.verified ?? 0,
        failed: body.failed ?? 0,
      });
    } catch (e) {
      setTwinState({
        kind: "error",
        message:
          e instanceof Error ? e.message : "Twin generation failed. Retry.",
      });
    }
  }

  async function confirmClassification() {
    if (errorType == null) return;
    setConfirmState("saving");
    try {
      await tagAttempt(attempt.id, {
        errorType,
        errorSubtag,
        userNotes: notes.trim() || null,
      });
      setConfirmState("saved");
    } catch {
      setConfirmState("error");
    }
  }

  const coach = coachState.kind === "done" ? coachState.coach : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-graphite">
        <Chip tone={attempt.correct ? "blue" : "red"}>
          {attempt.correct ? "Correct" : "Wrong"}
        </Chip>
        <Chip>{formatSeconds(attempt.timeSeconds)}</Chip>
        <Chip>{CONFIDENCE_LABELS[attempt.confidence]} confidence</Chip>
        <Chip>{SKILL_LABELS[question.fundamentalSkill]}</Chip>
        <Chip>{SUBTOPIC_LABELS[question.subtopic]}</Chip>
      </div>

      <details
        className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
        open
      >
        <summary className="cursor-pointer font-display text-sm font-semibold">
          The question
        </summary>
        <div className="mt-3 space-y-4 border-t border-grid pt-3">
          <Md source={question.stemMd} className="text-stem" />
          <ChoiceList
            choices={question.choices}
            selected={attempt.selectedIndex}
            revealed
            correctIndex={question.correctIndex}
            onSelect={() => {}}
          />
        </div>
      </details>

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <h2 className="font-display text-base font-semibold">
          Scratch work
        </h2>
        <p className="mb-3 mt-1 text-sm text-graphite">
          Photograph exactly what you wrote — the coach finds the line where
          the work left the rails.
        </p>
        <ScratchCapture
          images={images}
          onChange={setImages}
          disabled={coachState.kind === "running"}
        />
        <div className="mt-3 flex items-center gap-3">
          <Button
            onClick={runCoach}
            disabled={images.length === 0}
            busy={coachState.kind === "running"}
          >
            {coach || attempt.aiFeedbackMd
              ? "Re-run the post-mortem"
              : "Run the post-mortem"}
          </Button>
          {coachState.kind === "running" && (
            <span className="flex items-center gap-2 text-sm text-graphite">
              <span className="skeleton h-3 w-3 rounded-full" />
              {COACH_STAGES[coachState.stageIndex]}
            </span>
          )}
          {coachState.kind === "error" && (
            <ErrorBanner compact>{coachState.message}</ErrorBanner>
          )}
        </div>
      </section>

      {coachState.kind === "running" && (
        <div className="space-y-2 rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-2/3" />
        </div>
      )}

      {!coach && attempt.aiFeedbackMd && coachState.kind !== "running" && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="mb-2 font-display text-base font-semibold">
            Saved post-mortem
          </h2>
          <Md source={attempt.aiFeedbackMd} className="text-body" />
        </section>
      )}

      {coach && (
        <motion.section
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-4 rounded-card border border-grid bg-surface p-4 shadow-ambient"
        >
          <CoachBlock title="Divergence point" tone="red">
            <Md source={coach.divergence_point_md} className="text-body" />
          </CoachBlock>
          <CoachBlock title="Diagnosis">
            <Md source={coach.diagnosis_md} className="text-body" />
          </CoachBlock>
          <CoachBlock title="Fastest path vs. your path" tone="blue">
            <Md source={coach.fastest_path_md} className="text-body" />
          </CoachBlock>
          <CoachBlock title="Trigger cue">
            <Md source={coach.trigger_cue_md} className="text-body" />
          </CoachBlock>
          <CoachBlock title="Prescription">
            <p className="text-body">
              {coach.prescription.count} questions of{" "}
              <span className="font-medium">
                {SUBTOPIC_LABELS[coach.prescription.subtopic]}
              </span>
              .
            </p>
          </CoachBlock>
          <div className="rounded-control bg-highlight px-3 py-2 text-sm font-medium">
            {coach.takeaway_15_words}
          </div>
        </motion.section>
      )}

      {(coach || attempt.aiFeedbackMd) && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-base font-semibold">
            Classification
            <span className="ml-2 text-xs font-normal text-graphite">
              AI-suggested — confirm or override before it enters the log
            </span>
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ERROR_TYPES.map((et) => (
              <button
                key={et}
                onClick={() => {
                  setErrorType(et);
                  setConfirmState("unsaved");
                }}
                className={cn(
                  "rounded-control border px-2.5 py-1 text-xs",
                  errorType === et
                    ? "border-ink bg-highlight font-medium"
                    : "border-grid text-graphite hover:border-graphite/50",
                )}
              >
                {ERROR_TYPE_LABELS[et]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-xs text-graphite" htmlFor="subtag">
              Failed subtopic
            </label>
            <select
              id="subtag"
              value={errorSubtag ?? ""}
              onChange={(e) => {
                setErrorSubtag((e.target.value || null) as Subtopic | null);
                setConfirmState("unsaved");
              }}
              className="rounded-control border border-grid bg-surface px-2 py-1 text-sm"
            >
              <option value="">—</option>
              {ALL_SUBTOPICS.map((s) => (
                <option key={s} value={s}>
                  {SUBTOPIC_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setConfirmState("unsaved");
            }}
            placeholder="Your own note on this miss (optional)"
            rows={2}
            className="mt-3 w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm placeholder:text-graphite/60"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button
              size="sm"
              onClick={confirmClassification}
              disabled={errorType == null || confirmState === "saving"}
            >
              Confirm classification
            </Button>
            {confirmState === "saved" && (
              <span className="text-sm text-ballpoint">Logged.</span>
            )}
            {confirmState === "error" && (
              <ErrorBanner compact>Saving failed — retry.</ErrorBanner>
            )}
          </div>
        </section>
      )}

      {(coach || attempt.aiFeedbackMd) && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-base font-semibold">Twin drills</h2>
          <p className="mt-1 text-sm text-graphite">
            Two fresh twins of this question — same math skeleton, opposite
            context ({question.context === "pure" ? "real" : "pure"}). Both
            verified before they can appear.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {twinState.kind !== "done" && (
              <Button
                variant="accent"
                size="sm"
                onClick={queueTwins}
                busy={twinState.kind === "working"}
              >
                Queue two verified twin drills
              </Button>
            )}
            {twinState.kind === "working" && (
              <span className="flex items-center gap-2 text-sm text-graphite">
                <span className="skeleton h-3 w-3 rounded-full" />
                Generating and verifying twins…
              </span>
            )}
            {twinState.kind === "error" && (
              <ErrorBanner compact>{twinState.message}</ErrorBanner>
            )}
            {twinState.kind === "done" && (
              <>
                <span className="text-sm">
                  <span className="text-ballpoint">
                    {twinState.verified} twins verified
                  </span>
                  {twinState.failed > 0 && (
                    <span className="text-graphite">
                      {" "}
                      · {twinState.failed} failed verification
                    </span>
                  )}
                </span>
                {twinState.ids.length > 0 && (
                  <ButtonLink
                    href={`/drill?qids=${twinState.ids.join(",")}`}
                    size="sm"
                  >
                    Drill the twins now
                  </ButtonLink>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function CoachBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "red" | "blue";
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className={cn(
          "mb-1.5 font-display text-sm font-semibold",
          tone === "red" && "text-redpen",
          tone === "blue" && "text-ballpoint",
        )}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
