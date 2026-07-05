"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { FlagButton } from "@/components/drill/flag-button";
import { Md } from "@/components/math";
import { getQuestionHistory, type QuestionHistoryRow } from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import { CHOICE_LETTERS, cn } from "@/lib/utils";

/**
 * Solution contract, in order: fastest path, formal path (with trigger cue
 * and takeaway inside solution_md), trap anatomy per wrong choice.
 */
export function SolutionPanel({
  question,
  selectedIndex,
}: {
  question: Question;
  selectedIndex: number | null;
}) {
  const traps = Object.entries(question.trapMap ?? {})
    .map(([k, v]) => ({ index: Number(k), text: v }))
    .filter((t) => t.index !== question.correctIndex && t.text)
    .sort((a, b) => a.index - b.index);

  // Attempts on this exact question, newest first; the first row is the
  // attempt that just revealed this panel, so history means length > 1.
  const [history, setHistory] = useState<QuestionHistoryRow[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getQuestionHistory(question.id)
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [question.id]);
  const priorAttempts = history && history.length > 1 ? history.slice(1) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 rounded-card border border-grid bg-surface p-4 shadow-ambient"
    >
      <section>
        <h3 className="mb-1.5 font-display text-sm font-semibold text-ballpoint">
          Fastest path
        </h3>
        <Md source={question.fastestPathMd} className="text-body" />
      </section>

      <section className="border-t border-grid pt-3">
        <Md source={question.solutionMd} className="text-body" />
      </section>

      {traps.length > 0 && (
        <section className="border-t border-grid pt-3">
          <h3 className="mb-1.5 font-display text-sm font-semibold text-redpen">
            Trap anatomy
          </h3>
          <ul className="space-y-1.5">
            {traps.map((trap) => (
              <li
                key={trap.index}
                className={cn(
                  "flex items-start gap-2 rounded-control px-2 py-1 text-sm",
                  trap.index === selectedIndex &&
                    "bg-redpen/5 text-redpen",
                )}
              >
                <span className="mt-px font-mono text-xs font-medium">
                  {CHOICE_LETTERS[trap.index]}
                </span>
                <span className="min-w-0 flex-1">
                  <Md source={trap.text} />
                </span>
                {trap.index === selectedIndex && (
                  <span className="shrink-0 text-xs font-medium">
                    your pick
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-grid pt-3">
        <FlagButton questionId={question.id} />
      </section>

      {priorAttempts.length > 0 && (
        <section className="mt-4 border-t border-grid pt-3">
          <h3 className="font-display text-sm font-semibold text-graphite">
            Your history on this question
          </h3>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-graphite">
            {priorAttempts.map((a, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "font-mono font-semibold",
                    a.correct ? "text-ballpoint" : "text-redpen",
                  )}
                >
                  {a.correct ? "✓" : "✗"}
                </span>
                <span className="font-mono">
                  {Math.round(a.timeSeconds)}s
                </span>
                <span>
                  {formatDistanceToNow(new Date(a.createdAt), {
                    addSuffix: true,
                  })}
                  {a.mode === "redo" && " · redo"}
                  {a.focus === "casual" && " · casual"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
}
