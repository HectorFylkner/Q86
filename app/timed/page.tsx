import { count, eq } from "drizzle-orm";
import { TimedClient } from "@/components/timed/timed-client";
import { SectionTabs } from "@/components/section-tabs";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { editRecord } from "@/lib/edit-record";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TimedPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const verifiedTotal =
    (
      await db
        .select({ n: count() })
        .from(questions)
        .where(eq(questions.verified, true))
        .get()
    )?.n ?? 0;

  // Read on the server so the review screen can state the reader's actual
  // edit record instead of asserting one.
  const record = await editRecord();

  return (
    <div className="space-y-4">
      <SectionTabs group="practice" />
      <h1 className="font-display text-xl font-semibold">Timed sets</h1>
      <TimedClient
        verifiedTotal={verifiedTotal}
        autoStart={start === "full" || start === "mini" ? start : null}
        editRecord={record}
      />
    </div>
  );
}
