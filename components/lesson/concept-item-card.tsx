"use client";

import { useRef, useState } from "react";
import { Md } from "@/components/math";
import {
  finalizeConceptItem,
  type FinalizeConceptItemResult,
} from "@/lib/concept-learning-actions";
import type { ProgressiveHint } from "@/curriculum/v3/segments/types";
import { cn } from "@/lib/utils";

type ConceptItemCardProps = {
  conceptId: string;
  contentVersion: string;
  item: {
    id: string;
    kind: "example" | "check";
    label: string;
    authoredDifficulty: number;
    promptMd: string;
    intendedMethod: string;
    answerKind: "exact" | "numeric" | "multiple_choice";
    choices: readonly string[];
    hints: readonly ProgressiveHint[];
  };
};

export function ConceptItemCard({
  conceptId,
  contentVersion,
  item,
}: ConceptItemCardProps) {
  const [answer, setAnswer] = useState("");
  const [method, setMethod] = useState("");
  const [correction, setCorrection] = useState("");
  const [declaredUnknown, setDeclaredUnknown] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<FinalizeConceptItemResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const firstTouchRef = useRef<number | null>(null);

  const touch = () => {
    firstTouchRef.current ??= Date.now();
    setMessage(null);
  };

  const chooseAnswer = (value: string, target: "answer" | "correction") => {
    touch();
    if (target === "answer") setAnswer(value);
    else setCorrection(value);
  };

  const commit = () => {
    touch();
    if (!answer.trim() || !method.trim()) {
      setMessage("Commit both a method and an answer, or use “I don’t know yet.”");
      return;
    }
    setDeclaredUnknown(false);
    setCommitted(true);
  };

  const commitUnknown = () => {
    touch();
    setDeclaredUnknown(true);
    setCommitted(true);
    setAnswer("");
    setMethod("");
    setMessage(null);
  };

  const openNextHint = () => {
    touch();
    setHintLevel((level) => Math.min(item.hints.length, level + 1));
  };

  const reveal = async () => {
    if (!committed || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await finalizeConceptItem({
        conceptId,
        itemUid: item.id,
        itemKind: item.kind,
        itemContentVersion: contentVersion,
        originalAnswer: declaredUnknown ? null : answer.trim(),
        originalMethod: declaredUnknown ? null : method.trim(),
        declaredUnknown,
        correction: correction.trim() || null,
        highestHintLevel: hintLevel,
        timeSeconds:
          (Date.now() - (firstTouchRef.current ?? Date.now())) / 1000,
      });
      if (response.error) setMessage(response.error);
      else setResult(response);
    } catch {
      setMessage("The evidence could not be saved. Your commitment is still on screen.");
    } finally {
      setSaving(false);
    }
  };

  const answerControl = (target: "answer" | "correction") => {
    const value = target === "answer" ? answer : correction;
    if (item.answerKind === "multiple_choice") {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {item.choices.map((choice, index) => (
            <button
              key={`${item.id}.${index}`}
              type="button"
              onClick={() => chooseAnswer(String(index), target)}
              className={cn(
                "rounded-control border px-3 py-2 text-left text-sm transition-colors",
                value === String(index)
                  ? "border-ballpoint bg-ballpoint/10 text-ink"
                  : "border-grid bg-surface text-graphite hover:border-graphite/50",
              )}
            >
              <span className="mr-2 font-mono text-[11px] text-ballpoint">
                {String.fromCharCode(65 + index)}
              </span>
              <Md source={choice} className="inline leading-normal" />
            </button>
          ))}
        </div>
      );
    }
    return (
      <input
        type="text"
        value={value}
        onFocus={touch}
        onChange={(event) => chooseAnswer(event.target.value, target)}
        placeholder={item.answerKind === "numeric" ? "Fraction or decimal" : "Your answer"}
        className="w-full font-mono text-sm"
      />
    );
  };

  return (
    <article className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-grid px-4 py-3 sm:px-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ballpoint">
            {item.label}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-graphite">
            Authored D{item.authoredDifficulty} · stable item
          </p>
        </div>
        <span className="rounded-full border border-grid px-2 py-1 font-mono text-[10px] text-graphite">
          {item.kind === "example" ? "worked example" : "retrieval check"}
        </span>
      </header>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <Md source={item.promptMd} className="text-[15px]" />

        {!committed && !result && (
          <div className="space-y-3 border-t border-grid pt-4">
            <label className="block text-xs font-medium text-graphite">
              Method or setup
              <input
                type="text"
                value={method}
                onFocus={touch}
                onChange={(event) => {
                  touch();
                  setMethod(event.target.value);
                }}
                placeholder={`e.g. ${item.intendedMethod}`}
                className="mt-1.5 w-full text-sm"
              />
            </label>
            <div>
              <p className="mb-1.5 text-xs font-medium text-graphite">Answer</p>
              {answerControl("answer")}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={commit}
                className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white"
              >
                Freeze method + answer
              </button>
              <button
                type="button"
                onClick={commitUnknown}
                className="rounded-control border border-grid px-4 py-2 text-sm text-graphite hover:border-graphite/50"
              >
                I don’t know yet
              </button>
            </div>
          </div>
        )}

        {!result && hintLevel > 0 && (
          <ol className="space-y-2" aria-label="Progressive hints">
            {item.hints.slice(0, hintLevel).map((hint, index) => (
              <li
                key={hint.id}
                className="rounded-control border border-amber/30 bg-amber/5 px-3 py-2"
              >
                <p className="font-mono text-[10px] uppercase tracking-wide text-amber">
                  Hint {index + 1} · {hint.kind.replace("_", " ")}
                </p>
                <Md source={hint.textMd} className="mt-1 text-sm" />
              </li>
            ))}
          </ol>
        )}

        {!result && hintLevel < item.hints.length && (
          <button
            type="button"
            onClick={openNextHint}
            className="rounded-control border border-amber/40 px-3 py-2 text-xs font-medium text-amber hover:bg-amber/5"
          >
            {hintLevel === 0 ? "Use the first hint" : `Use hint ${hintLevel + 1}`}
          </button>
        )}

        {committed && !result && (
          <div className="space-y-3 rounded-card border border-ballpoint/25 bg-ballpoint/5 p-4">
            <p className="text-sm text-graphite">
              {declaredUnknown ? (
                "Recorded commitment: I don’t know yet."
              ) : (
                <>
                  Frozen answer <span className="font-mono font-medium text-ink">{answer}</span>
                  {" · "}method <span className="font-medium text-ink">{method}</span>
                </>
              )}
            </p>
            <div>
              <p className="mb-1.5 text-xs text-graphite">
                Optional correction before seeing the key
              </p>
              {answerControl("correction")}
            </div>
            <button
              type="button"
              onClick={reveal}
              disabled={saving}
              aria-controls={`${item.id}-solution`}
              className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Recording…" : "Reveal solution + record evidence"}
            </button>
          </div>
        )}

        {message && (
          <p className="text-sm text-redpen" role="alert">
            {message}
          </p>
        )}

        {result && (
          <div id={`${item.id}-solution`} className="space-y-4 border-t border-grid pt-4">
            <div
              className={cn(
                "rounded-control border px-3 py-2 text-sm",
                result.initialCorrect && hintLevel === 0
                  ? "border-ballpoint/40 bg-ballpoint/5"
                  : "border-amber/40 bg-amber/5",
              )}
              role="status"
            >
              <p className="font-medium">
                {result.initialCorrect
                  ? hintLevel === 0
                    ? "Independent initial answer matched."
                    : "Initial answer matched with assistance logged."
                  : result.finalCorrect
                    ? "Initial answer missed; the correction matched."
                    : "The committed answer did not match."}
              </p>
              {result.remediationCreated && (
                <p className="mt-1 text-xs text-graphite">
                  A targeted retry was added; assisted or corrected work does not count as independent mastery.
                </p>
              )}
            </div>
            <div className="rounded-control border border-ballpoint/25 bg-ballpoint/5 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wide text-ballpoint">
                Canonical answer
              </p>
              <Md source={result.answerLabelMd} className="mt-1 text-sm font-medium" />
            </div>
            <Md source={result.solutionMd} className="text-sm" />
          </div>
        )}
      </div>
    </article>
  );
}
