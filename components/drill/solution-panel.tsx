"use client";

import { motion } from "framer-motion";
import { Md } from "@/components/math";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 rounded-[10px] border border-grid bg-surface p-4 shadow-ambient"
    >
      <section>
        <h3 className="mb-1.5 font-display text-sm font-semibold text-ballpoint">
          Fastest path
        </h3>
        <Md source={question.fastestPathMd} className="text-[15px]" />
      </section>

      <section className="border-t border-grid pt-3">
        <Md source={question.solutionMd} className="text-[15px]" />
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
                  "flex items-start gap-2 rounded-[6px] px-2 py-1 text-sm",
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
    </motion.div>
  );
}
