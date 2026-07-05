"use client";

import { motion } from "framer-motion";

/**
 * A single drawn check (ballpoint) or cross (red pen) stroke.
 * No shake, no confetti — ever.
 */
export function ResultStroke({
  kind,
  size = 18,
  delay = 0,
  instant = false,
}: {
  kind: "check" | "cross";
  size?: number;
  delay?: number;
  /** Already-marked history renders fully drawn: the pen animation is
   *  reserved for the moment a result is first revealed. */
  instant?: boolean;
}) {
  const stroke = kind === "check" ? "var(--ballpoint)" : "var(--redpen)";
  const paths =
    kind === "check"
      ? ["M3.5 10.5 L8 15 L16.5 4.5"]
      : ["M4.5 4.5 L15.5 15.5", "M15.5 4.5 L4.5 15.5"];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {paths.map((d, i) =>
        instant ? (
          <path
            key={i}
            d={d}
            stroke={stroke}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <motion.path
            key={i}
            d={d}
            stroke={stroke}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.22,
              delay: delay + i * 0.09,
              ease: "easeOut",
            }}
          />
        ),
      )}
    </svg>
  );
}
