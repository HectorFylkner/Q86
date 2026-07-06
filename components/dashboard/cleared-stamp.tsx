"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The grader's rubber stamp for a finished day: it lands once — scale
 * settles on a stiff spring, the rotation over-shoots and rests slightly
 * askew, the way a real stamp never sits straight. This is the page's one
 * deliberate motion moment; under reduced motion it simply appears.
 */
export function ClearedStamp({ label }: { label: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { opacity: 0, scale: 1.9, rotate: -18 }}
      animate={{ opacity: 1, scale: 1, rotate: -5 }}
      transition={{ type: "spring", stiffness: 380, damping: 21, delay: 0.15 }}
      className="inline-block rounded-[8px] border-2 border-redpen p-[3px]"
    >
      <span className="inline-block rounded-[5px] border border-redpen px-4 py-1.5 font-display text-lg font-bold uppercase tracking-[0.28em] text-redpen sm:px-5 sm:text-xl">
        {label}
      </span>
    </motion.span>
  );
}
