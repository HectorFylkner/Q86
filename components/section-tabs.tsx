"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import type { Key } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** The grouped sections behind the consolidated top nav. Each page in a
 *  group renders <SectionTabs group="…" /> under its title so the group
 *  reads as one place with views, not separate destinations. */
export const SECTION_GROUPS = {
  review: [
    { href: "/deck", key: "sections.deck" },
    { href: "/queue", key: "sections.queue" },
  ],
  trainers: [
    { href: "/patterns", key: "sections.patterns" },
    { href: "/decide", key: "sections.decide" },
  ],
  progress: [
    { href: "/mastery", key: "sections.mastery" },
    { href: "/analytics", key: "sections.analytics" },
    { href: "/import", key: "sections.import" },
  ],
} as const satisfies Record<string, ReadonlyArray<{ href: string; key: Key }>>;

export function SectionTabs({
  group,
}: {
  group: keyof typeof SECTION_GROUPS;
}) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      aria-label={t("nav.sectionLabel")}
      className="flex gap-5 border-b border-grid"
    >
      {SECTION_GROUPS[group].map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm transition-colors",
              active
                ? "border-ballpoint font-medium text-ink"
                : "border-transparent text-graphite hover:text-ink",
            )}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
