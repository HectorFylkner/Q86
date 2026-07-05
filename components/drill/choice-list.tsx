"use client";

import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { ResultStroke } from "@/components/drill/result-stroke";
import { CHOICE_LETTERS, cn } from "@/lib/utils";

export function ChoiceList({
  choices,
  selected,
  revealed,
  correctIndex,
  onSelect,
}: {
  choices: string[];
  selected: number | null;
  revealed: boolean;
  correctIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Answer choices" className="space-y-2">
      {choices.map((choice, i) => {
        const isSelected = selected === i;
        const isCorrect = revealed && i === correctIndex;
        const isWrongPick = revealed && isSelected && i !== correctIndex;
        return (
          <button
            key={i}
            role="radio"
            aria-checked={isSelected}
            disabled={revealed}
            onClick={() => onSelect(i)}
            className={cn(
              "relative block min-h-[44px] w-full overflow-hidden rounded-control border px-3 py-2.5 text-left text-body transition-colors duration-150",
              !revealed && "cursor-pointer hover:border-graphite/50",
              isCorrect
                ? "border-ballpoint/70"
                : isWrongPick
                  ? "border-redpen/70"
                  : isSelected
                    ? "border-ink/50"
                    : "border-grid",
              revealed && !isCorrect && !isWrongPick && "opacity-60",
            )}
          >
            {/* 120 ms background sweep to --highlight on selection */}
            {isSelected && !revealed && (
              <motion.span
                aria-hidden
                className="absolute inset-0 origin-left bg-highlight"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              />
            )}
            <span className="relative flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-control border font-mono text-xs font-medium",
                  isSelected && !revealed
                    ? "border-ink bg-ink text-surface"
                    : "border-grid text-graphite",
                  isCorrect && "border-ballpoint text-ballpoint",
                  isWrongPick && "border-redpen text-redpen",
                )}
              >
                {CHOICE_LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <Md source={choice} />
              </span>
              {isCorrect && <ResultStroke kind="check" />}
              {isWrongPick && <ResultStroke kind="cross" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
