"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatSeconds } from "@/lib/utils";

export type Checkpoint = {
  /** Seconds remaining when this checkpoint should be reached. */
  remainingTarget: number;
  label: string;
};

/**
 * The time-ink bar: a thin ink line across the top drains with the section
 * clock. Checkpoint ticks fade in as they pass. The 2:45 decision pulse is
 * a single 300 ms opacity/scale beat — never a modal, never blocking.
 */
export function TimeInkBar({
  totalSeconds,
  remainingSeconds,
  checkpoints,
  pulseKey,
}: {
  totalSeconds: number;
  remainingSeconds: number;
  checkpoints: Checkpoint[];
  pulseKey: number;
}) {
  const fraction = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));

  return (
    <div className="sticky top-14 z-30 -mx-4 bg-paper/95 px-4 pb-1 pt-2 sm:-mx-6 sm:px-6">
      <div className="relative">
        <div className="h-[3px] w-full rounded-full bg-grid" />
        <motion.div
          key={pulseKey}
          className="absolute inset-x-0 top-0 h-[3px] origin-left rounded-full bg-ballpoint"
          style={{ scaleX: fraction }}
          animate={
            pulseKey > 0
              ? { opacity: [1, 0.35, 1], scaleY: [1, 2, 1] }
              : undefined
          }
          transition={{ duration: 0.3 }}
        />
        {checkpoints.map((cp) => {
          const pos = cp.remainingTarget / totalSeconds;
          const passed = remainingSeconds <= cp.remainingTarget;
          return (
            <div
              key={cp.label}
              className="absolute -top-0.5"
              style={{ left: `${pos * 100}%` }}
            >
              <div
                className={cn(
                  "h-2 w-px",
                  passed ? "bg-graphite" : "bg-grid",
                )}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: passed ? 1 : 0.45 }}
                transition={{ duration: 0.4 }}
                className="mt-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-graphite"
              >
                {cp.label}
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs text-graphite">
        <span>{formatSeconds(remainingSeconds)} remaining</span>
      </div>
    </div>
  );
}
