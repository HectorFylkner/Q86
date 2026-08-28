"use client";

import { useState } from "react";
import { Bookmark, Pencil } from "lucide-react";
import { Md } from "@/components/math";
import { ChoiceList } from "@/components/drill/choice-list";
import type { AnswerRecord } from "@/components/timed/timed-client";
import type { TimedEditInput } from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import {
  EDIT_REASONS,
  type EditReason,
} from "@/lib/taxonomy";
import { useT } from "@/components/i18n-provider";
import { editReasonLabel } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

const MAX_EDITS = 3;
const MIN_JUSTIFICATION = 20;

/**
 * Official-style Review & Edit screen. Committing a change requires a
 * reason and a ≥20-character justification naming the specific error —
 * "it feels wrong" is not a category on purpose.
 */
export function ReviewGrid({
  questions,
  answers,
  bookmarks,
  edits,
  onToggleBookmark,
  onCommitEdit,
  onSubmit,
}: {
  questions: Question[];
  answers: (AnswerRecord | null)[];
  bookmarks: boolean[];
  edits: TimedEditInput[];
  onToggleBookmark: (index: number) => void;
  onCommitEdit: (
    questionIndex: number,
    toIndex: number,
    reason: EditReason,
    justification: string,
  ) => void;
  onSubmit: () => void;
}) {
  const t = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [reason, setReason] = useState<EditReason | null>(null);
  const [justification, setJustification] = useState("");

  const editsUsed = edits.length;
  const editedQuestionIds = new Set(edits.map((e) => e.questionId));

  function openQuestion(i: number) {
    setOpenIndex(i);
    setPendingIndex(null);
    setReason(null);
    setJustification("");
  }

  if (openIndex != null) {
    const q = questions[openIndex];
    const answer = answers[openIndex];
    const editing = pendingIndex != null && pendingIndex !== answer?.selectedIndex;
    const justificationOk = justification.trim().length >= MIN_JUSTIFICATION;
    const canCommit = editing && reason != null && justificationOk;
    const editsLeft = editsUsed < MAX_EDITS;

    return (
      <div className="mx-auto mt-4 max-w-3xl space-y-4">
        <div className="flex items-center justify-between text-xs text-graphite">
          <button
            onClick={() => setOpenIndex(null)}
            className="rounded-control border border-grid bg-surface px-2.5 py-1 hover:border-graphite/50"
          >
            ← Back to review grid
          </button>
          <span className="font-mono">
            {t("review.questionEdits", {
              n: openIndex + 1,
              used: editsUsed,
              max: MAX_EDITS,
            })}
          </span>
        </div>

        <div className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
          <Md source={q.stemMd} className="text-[16px]" />
          <div className="mt-5">
            <ChoiceList
              choices={q.choices}
              selected={pendingIndex ?? answer?.selectedIndex ?? null}
              revealed={false}
              correctIndex={q.correctIndex}
              onSelect={(i) => {
                if (!editsLeft) return;
                setPendingIndex(i);
              }}
            />
          </div>

          {!editsLeft && (
            <p className="mt-3 text-sm text-graphite">
              {t("review.limitReached", { max: MAX_EDITS })}
            </p>
          )}

          {editing && (
            <div className="mt-4 space-y-3 rounded-control border border-amber/50 bg-highlight/50 p-4">
              <p className="text-sm font-medium">
                {t("review.changingLede")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EDIT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                      "rounded-control border px-2.5 py-1 text-xs",
                      reason === r
                        ? "border-ink bg-surface font-medium"
                        : "border-grid bg-surface/60 text-graphite hover:border-graphite/50",
                    )}
                  >
                    {editReasonLabel(t, r)}
                  </button>
                ))}
              </div>
              <div>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder={t("timed.justificationPlaceholder")}
                  rows={2}
                  className="w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm placeholder:text-graphite/60"
                />
                <p
                  className={cn(
                    "mt-1 text-right font-mono text-[11px]",
                    justificationOk ? "text-graphite" : "text-amber",
                  )}
                >
                  {justification.trim().length}/{MIN_JUSTIFICATION}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!canCommit || reason == null || pendingIndex == null)
                      return;
                    onCommitEdit(
                      openIndex,
                      pendingIndex,
                      reason,
                      justification.trim(),
                    );
                    setOpenIndex(null);
                  }}
                  disabled={!canCommit}
                  className={cn(
                    "rounded-control bg-redpen px-4 py-1.5 text-sm font-medium text-white hover:bg-redpen/90",
                    !canCommit && "cursor-not-allowed opacity-50",
                  )}
                >
                  {t("timed.commitChange")}
                </button>
                <button
                  onClick={() => {
                    setPendingIndex(null);
                    setReason(null);
                    setJustification("");
                  }}
                  className="rounded-control border border-grid bg-surface px-4 py-1.5 text-sm hover:border-graphite/50"
                >
                  {t("timed.keepOriginal")}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-grid pt-3">
            <button
              onClick={() => onToggleBookmark(openIndex)}
              className={cn(
                "flex items-center gap-1 rounded-control border px-2 py-1 text-xs",
                bookmarks[openIndex]
                  ? "border-amber bg-highlight text-amber"
                  : "border-grid text-graphite hover:border-graphite/50",
              )}
            >
              <Bookmark size={12} />
              {bookmarks[openIndex]
                ? t("timed.bookmarked")
                : t("timed.bookmark")}
            </button>
            {editedQuestionIds.has(q.id) && (
              <span className="text-xs text-graphite">
                {t("timed.editedThisSession")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-3xl space-y-4">
      <div className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">
            {t("timed.reviewAndEdit")}
          </h2>
          <span className="font-mono text-xs text-graphite">
            {t("review.editsUsed", { used: editsUsed, max: MAX_EDITS })}
          </span>
        </div>
        <p className="mt-1 text-sm text-graphite">{t("review.yourRecord")}</p>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => openQuestion(i)}
              className={cn(
                "relative flex h-12 flex-col items-center justify-center rounded-control border text-sm transition-colors duration-150 hover:border-graphite/50",
                editedQuestionIds.has(q.id)
                  ? "border-redpen/50 bg-redpen/5"
                  : "border-grid bg-surface",
              )}
            >
              <span className="font-mono">{i + 1}</span>
              <span className="text-[9px] text-graphite">
                {answers[i] ? t("review.answered") : "—"}
              </span>
              {bookmarks[i] && (
                <Bookmark
                  size={11}
                  className="absolute right-1 top-1 text-amber"
                  fill="currentColor"
                />
              )}
              {editedQuestionIds.has(q.id) && (
                <Pencil
                  size={11}
                  className="absolute left-1 top-1 text-redpen"
                />
              )}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end border-t border-grid pt-4">
          <button
            onClick={onSubmit}
            className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
          >
            {t("timed.submitSection")}
          </button>
        </div>
      </div>
    </div>
  );
}
