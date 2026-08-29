"use client";

import { motion } from "framer-motion";

/**
 * One of the three moments the public site animates.
 *
 * `MotionConfig reducedMotion="user"` in the root providers already drops
 * the translation for anyone who asked for less motion, leaving the fade —
 * so this is safe to use without a second check.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** The hero's headline, revealed a line at a time. The only place on the
 *  site where motion carries meaning rather than decoration: the three
 *  lines are the argument, and they arrive in the order you read them. */
export function StaggeredLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <motion.span
          key={line}
          className="block"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08 * i,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          {line}
        </motion.span>
      ))}
    </>
  );
}
