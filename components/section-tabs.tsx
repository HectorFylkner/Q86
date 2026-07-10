"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    { href: "/quality", label: "Question QA" },
    { href: "/import", label: "Import & backup" },
  ],
} as const;

export function SectionTabs({
  group,
}: {
  group: keyof typeof SECTION_GROUPS;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Section"
      className="flex gap-5 overflow-x-auto border-b border-grid"
    >
      {SECTION_GROUPS[group].map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-2 text-sm transition-colors",
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
