"use client";

import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  // reducedMotion="user" disables transform/scale animation for users with
  // prefers-reduced-motion while keeping opacity fades.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
