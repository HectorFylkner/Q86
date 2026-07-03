import Link from "next/link";
import { listLessons } from "@/lib/lessons";
import { FUNDAMENTAL_SKILLS, SKILL_LABELS } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function LearnPage() {
  const lessons = listLessons();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">Learn</h1>
        <p className="text-xs text-graphite">
          {lessons.length} concept chapters — read, then drill the same
          subtopic while it&apos;s warm.
        </p>
      </div>

      {lessons.length === 0 && (
        <p className="rounded-card border border-grid bg-surface p-6 text-sm text-graphite shadow-ambient">
          Chapters are being written — check back shortly.
        </p>
      )}

      {FUNDAMENTAL_SKILLS.map((skill) => {
        const group = lessons.filter((l) => l.skill === skill);
        if (group.length === 0) return null;
        return (
          <section
            key={skill}
            className="rounded-card border border-grid bg-surface p-5 shadow-ambient"
          >
            <h2 className="font-display text-sm font-semibold">
              {SKILL_LABELS[skill]}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {group.map((lesson) => (
                <Link
                  key={lesson.subtopic}
                  href={`/learn/${lesson.subtopic}`}
                  className="group rounded-control border border-grid px-4 py-3 transition-colors hover:border-ballpoint/50 hover:bg-highlight/40"
                >
                  <span className="block text-sm font-medium group-hover:text-ballpoint">
                    {lesson.title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-graphite">
                    ~{lesson.minutes} min read
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
