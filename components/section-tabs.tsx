"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** The grouped sections behind the consolidated top nav. Each page in a
 *  group renders <SectionTabs group="…" /> under its title so the group
 *  reads as one place with views, not separate destinations. */
export const SECTION_GROUPS = {
  review: [
    { href: "/deck", label: "Takeaway deck" },
    { href: "/queue", label: "Redo queue" },
  ],
  trainers: [
    { href: "/patterns", label: "Mental math" },
    { href: "/decide", label: "Decision triage" },
  ],
  progress: [
    { href: "/mastery", label: "Mastery" },
    { href: "/analytics", label: "Analytics" },
    { href: "/import", label: "Import & backup" },
  ],
} as const;

/** Location grammar: the current view carries a ballpoint underline —
 *  never a weight change, so tabs keep their width. */
export function SectionTabs({
  group,
}: {
  group: keyof typeof SECTION_GROUPS;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Section" className="flex gap-5 border-b border-grid">
      {SECTION_GROUPS[group].map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative -mb-px pb-2 text-sm transition-colors duration-150",
              active ? "text-ink" : "text-graphite hover:text-ink",
            )}
          >
            {tab.label}
            {active && (
              <motion.span
                layoutId={`section-tab-${group}`}
                className="absolute inset-x-0 bottom-0 h-0.5 bg-ballpoint"
                transition={{ duration: 0.15, ease: "easeOut" }}
                aria-hidden
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
