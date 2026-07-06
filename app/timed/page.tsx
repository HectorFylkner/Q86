import { count, eq } from "drizzle-orm";
import { TimedClient } from "@/components/timed/timed-client";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TimedPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; resume?: string }>;
}) {
  const { start, resume } = await searchParams;
  const verifiedTotal =
    (
      await db
        .select({ n: count() })
        .from(questions)
        .where(eq(questions.verified, true))
        .get()
    )?.n ?? 0;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Timed sets</h1>
      <TimedClient
        verifiedTotal={verifiedTotal}
        autoStart={start === "full" || start === "mini" ? start : null}
        autoResume={resume === "1"}
      />
    </div>
  );
}
