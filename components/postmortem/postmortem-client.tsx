"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { ChoiceList } from "@/components/drill/choice-list";
import { ScratchCapture } from "@/components/postmortem/capture";
import { tagAttempt } from "@/lib/actions";
import type { CoachResponse } from "@/lib/ai/schemas";
import type { Attempt, Question } from "@/lib/db/schema";
import {
  ERROR_TYPES,
  ALL_SUBTOPICS,
  type ErrorType,
  type Subtopic,
} from "@/lib/taxonomy";
import { useT } from "@/components/i18n-provider";
import type { Key } from "@/lib/i18n";
import { limitMessage } from "@/lib/ops/limit-message";
import {
  confidenceLabel,
  contextLabel,
  errorTypeLabel,
  skillLabel,
  subtopicLabel,
} from "@/lib/i18n/labels";
import { cn, formatSeconds } from "@/lib/utils";

const COACH_STAGE_KEYS: Key[] = [
  "postmortem.stageReading",
  "postmortem.stageClassifying",
  "postmortem.stagePrescribing",
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
  canGenerate,
}: {
  attempt: Attempt;
  question: Question;
  /** Twin generation writes into the shared verified bank, so it is the
   *  operator's tool, not a subscriber's (ADR 0001 §2). */
  canGenerate: boolean;
}) {
  const t = useT();
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
    const timer = setInterval(() => {
      setCoachState((s) =>
        s.kind === "running"
          ? {
              kind: "running",
              stageIndex: (s.stageIndex + 1) % COACH_STAGE_KEYS.length,
            }
          : s,
      );
    }, 6000);
    return () => clearInterval(timer);
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
        reason?: string;
      };
      // A rate limit or a cost cap is not a fault; it gets its own
      // sentence, in the reader's language, rather than a raw error.
      const limited = limitMessage(t, body);
      if (limited) throw new Error(limited);
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
            : t("postmortem.coachFailed"),
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
          e instanceof Error ? e.message : t("postmortem.twinError"),
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
          {attempt.correct
            ? t("postmortem.correct")
            : t("postmortem.wrong")}
        </Chip>
        <Chip>{formatSeconds(attempt.timeSeconds)}</Chip>
        <Chip>
          {t("postmortem.confidenceChip", {
            level: confidenceLabel(t, attempt.confidence),
          })}
        </Chip>
        <Chip>{skillLabel(t, question.fundamentalSkill)}</Chip>
        <Chip>{subtopicLabel(t, question.subtopic)}</Chip>
      </div>

      <details
        className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
        open
      >
        <summary className="cursor-pointer font-display text-sm font-semibold">
          {t("postmortem.theQuestion")}
        </summary>
        <div className="mt-3 space-y-4 border-t border-grid pt-3">
          <Md source={question.stemMd} className="text-[15px]" />
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
        <h2 className="font-display text-sm font-semibold">
          {t("postmortem.scratchWork")}
        </h2>
        <p className="mb-3 mt-1 text-sm text-graphite">
          {t("postmortem.scratchLede")}
        </p>
        <ScratchCapture
          images={images}
          onChange={setImages}
          disabled={coachState.kind === "running"}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={runCoach}
            disabled={images.length === 0 || coachState.kind === "running"}
            className={cn(
              "rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90",
              (images.length === 0 || coachState.kind === "running") &&
                "cursor-not-allowed opacity-50",
            )}
          >
            {coach || attempt.aiFeedbackMd
              ? t("postmortem.rerunCoach")
              : t("postmortem.runCoach")}
          </button>
          {coachState.kind === "running" && (
            <span className="flex items-center gap-2 text-sm text-graphite">
              <span className="skeleton h-3 w-3 rounded-full" />
              {t(COACH_STAGE_KEYS[coachState.stageIndex])}
            </span>
          )}
          {coachState.kind === "error" && (
            <span className="text-sm text-redpen">{coachState.message}</span>
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
          <h2 className="mb-2 font-display text-sm font-semibold">
            {t("postmortem.savedPostmortem")}
          </h2>
          <Md source={attempt.aiFeedbackMd} className="text-[15px]" />
        </section>
      )}

      {coach && (
        <motion.section
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-4 rounded-card border border-grid bg-surface p-4 shadow-ambient"
        >
          <CoachBlock title={t("postmortem.divergencePoint")} tone="red">
            <Md source={coach.divergence_point_md} className="text-[15px]" />
          </CoachBlock>
          <CoachBlock title={t("postmortem.diagnosis")}>
            <Md source={coach.diagnosis_md} className="text-[15px]" />
          </CoachBlock>
          <CoachBlock title={t("postmortem.fastestVsYours")} tone="blue">
            <Md source={coach.fastest_path_md} className="text-[15px]" />
          </CoachBlock>
          <CoachBlock title={t("postmortem.triggerCue")}>
            <Md source={coach.trigger_cue_md} className="text-[15px]" />
          </CoachBlock>
          <CoachBlock title={t("postmortem.prescription")}>
            <p className="text-[15px]">
              {t("prescriptionLine.text", {
                count: coach.prescription.count,
                subtopic: subtopicLabel(t, coach.prescription.subtopic),
              })}
            </p>
          </CoachBlock>
          <div className="rounded-control bg-highlight px-3 py-2 text-sm font-medium">
            {coach.takeaway_15_words}
          </div>
        </motion.section>
      )}

      {(coach || attempt.aiFeedbackMd) && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-sm font-semibold">
            {t("postmortem.classification")}
            <span className="ml-2 text-xs font-normal text-graphite">
              {t("postmortem.classificationHint")}
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
                {errorTypeLabel(t, et)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-xs text-graphite" htmlFor="subtag">
              {t("postmortem.failedSubtopic")}
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
                  {subtopicLabel(t, s)}
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
            placeholder={t("postmortem.notePlaceholder")}
            rows={2}
            className="mt-3 w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm placeholder:text-graphite/60"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={confirmClassification}
              disabled={errorType == null || confirmState === "saving"}
              className={cn(
                "rounded-control bg-ballpoint px-4 py-1.5 text-sm font-medium text-white hover:bg-ballpoint/90",
                (errorType == null || confirmState === "saving") &&
                  "opacity-50",
              )}
            >
              {t("postmortem.confirmClassification")}
            </button>
            {confirmState === "saved" && (
              <span className="text-sm text-ballpoint">
                {t("postmortem.logged")}
              </span>
            )}
            {confirmState === "error" && (
              <span className="text-sm text-redpen">
                {t("settings.saveFailed")}
              </span>
            )}
          </div>
        </section>
      )}

      {canGenerate && (coach || attempt.aiFeedbackMd) && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-sm font-semibold">
            {t("postmortem.twinTitle")}
          </h2>
          <p className="mt-1 text-sm text-graphite">
            {t("postmortem.twinLede", {
              context: contextLabel(
                t,
                question.context === "pure" ? "real" : "pure",
              ),
            })}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {twinState.kind !== "done" && (
              <button
                onClick={queueTwins}
                disabled={twinState.kind === "working"}
                className={cn(
                  "rounded-control border border-ballpoint px-4 py-1.5 text-sm font-medium text-ballpoint hover:bg-ballpoint/5",
                  twinState.kind === "working" && "cursor-wait opacity-60",
                )}
              >
                {t("postmortem.twinQueue")}
              </button>
            )}
            {twinState.kind === "working" && (
              <span className="flex items-center gap-2 text-sm text-graphite">
                <span className="skeleton h-3 w-3 rounded-full" />
                {t("postmortem.twinWorking")}
              </span>
            )}
            {twinState.kind === "error" && (
              <span className="text-sm text-redpen">{twinState.message}</span>
            )}
            {twinState.kind === "done" && (
              <>
                <span className="text-sm">
                  <span className="text-ballpoint">
                    {t("postmortem.twinVerified", {
                      count: twinState.verified,
                    })}
                  </span>
                  {twinState.failed > 0 && (
                    <span className="text-graphite">
                      {" "}
                      ·{" "}
                      {t("postmortem.twinFailed", { count: twinState.failed })}
                    </span>
                  )}
                </span>
                {twinState.ids.length > 0 && (
                  <Link
                    href={`/drill?qids=${twinState.ids.join(",")}`}
                    className="rounded-control bg-ballpoint px-4 py-1.5 text-sm font-medium text-white hover:bg-ballpoint/90"
                  >
                    {t("postmortem.twinDrill")}
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "red" | "blue";
}) {
  return (
    <span
      className={cn(
        "rounded-control border px-1.5 py-0.5 text-[11px]",
        tone === "red"
          ? "border-redpen/50 text-redpen"
          : tone === "blue"
            ? "border-ballpoint/50 text-ballpoint"
            : "border-grid bg-surface",
      )}
    >
      {children}
    </span>
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
