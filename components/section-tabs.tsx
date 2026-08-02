"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The grouped views behind the five-item top nav. Each page in a group
 * renders <SectionTabs group="…" /> under its title so the group reads as
 * one place with views, not as separate destinations.
 *
 * Practice holds everything that means "answer questions under some
 * condition" — the untimed drill, the section simulator, and the two
 * trainers that used to occupy a top-level slot of their own for what is
 * really two mini-drills.
 *
 * Import & backup is deliberately absent. It is housekeeping rather than
 * a daily verb, and a tab bar that carries it makes Progress read as
 * three equal things when it is two views and a settings page. It is
 * linked from the score-report card, which is the data it feeds, and
 * from the settings row on Today.
 */
export const SECTION_GROUPS = {
  practice: [
    { href: "/drill", label: "Drill" },
    { href: "/timed", label: "Timed section" },
    { href: "/patterns", label: "Mental math" },
    { href: "/decide", label: "Decision triage" },
  ],
  review: [
    { href: "/deck", label: "Takeaway deck" },
    { href: "/queue", label: "Redo queue" },
  ],
  progress: [
    { href: "/mastery", label: "Mastery" },
    { href: "/analytics", label: "Report" },
  ],
} as const;

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
              "-mb-px inline-flex min-h-[44px] items-end border-b-2 pb-2 text-body transition-colors",
              active
                ? "border-ballpoint font-medium text-ink"
                : "border-transparent text-graphite hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
