import Link from "next/link";
import { and, count, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { questions, redoQueue } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function TodayPage() {
  const verifiedCount =
    db
      .select({ n: count() })
      .from(questions)
      .where(eq(questions.verified, true))
      .get()?.n ?? 0;
  const dueRedos =
    db
      .select({ n: count() })
      .from(redoQueue)
      .where(
        and(eq(redoQueue.cleared, false), lte(redoQueue.dueAt, new Date())),
      )
      .get()?.n ?? 0;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Today</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          title="Drill"
          body={`${verifiedCount} verified questions in the bank.`}
          href="/drill"
          cta="Start a drill"
        />
        <Card
          title="Redo queue"
          body={
            dueRedos > 0
              ? `${dueRedos} questions due for redo.`
              : "Nothing due. Generate a VOF drill or start a timed set."
          }
          href="/queue"
          cta="Open the queue"
        />
        <Card
          title="Timed set"
          body="Full 21-question section or a 7-question mini."
          href="/timed"
          cta="Start a timed set"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col rounded-[10px] border border-grid bg-surface p-5 shadow-ambient">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-graphite">{body}</p>
      <Link
        href={href}
        className="mt-3 text-sm font-medium text-ballpoint hover:underline"
      >
        {cta} →
      </Link>
    </div>
  );
}
