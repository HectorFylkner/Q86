"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Odometer roll for changing numerals: each digit is a vertical reel that
 * springs to its value (stiffness 260, damping 28). Non-digit characters
 * ("%", ":", ".") render statically. On mount, digits roll up from 0.
 */
export function Odometer({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-baseline", className)}
      aria-label={text}
    >
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <DigitReel key={i} digit={Number(ch)} />
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DigitReel({ digit }: { digit: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-[1em] overflow-hidden align-baseline"
      style={{ width: "1ch" }}
    >
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={{ y: "0em" }}
        animate={{ y: `-${digit}em` }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1em] leading-[1em]">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
