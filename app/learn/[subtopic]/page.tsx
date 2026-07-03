import Link from "next/link";
import { notFound } from "next/navigation";
import { Md } from "@/components/math";
import { readLesson } from "@/lib/lessons";
import {
  ALL_SUBTOPICS,
  SKILL_BY_SUBTOPIC,
  SKILL_LABELS,
  type Subtopic,
} from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}) {
  const { subtopic } = await params;
  if (!ALL_SUBTOPICS.includes(subtopic as Subtopic)) notFound();
  const lesson = readLesson(subtopic as Subtopic);
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
          <Link href="/learn" className="hover:text-ink">
            Learn
          </Link>{" "}
          · {SKILL_LABELS[SKILL_BY_SUBTOPIC[subtopic as Subtopic]]}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          {lesson.title}
        </h1>
      </div>

      <article className="rounded-card border border-grid bg-surface p-6 shadow-ambient sm:p-8">
        <Md source={lesson.body} className="text-[15px]" />
      </article>

      <div className="flex flex-wrap gap-2 pb-4">
        <Link
          href={`/drill?sub=${subtopic}&d=3`}
          className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90"
        >
          Drill this now →
        </Link>
        <Link
          href="/mastery"
          className="rounded-control border border-grid px-4 py-2 text-sm text-graphite transition-colors hover:border-graphite/50 hover:text-ink"
        >
          See your ladder
        </Link>
      </div>
    </div>
  );
}
