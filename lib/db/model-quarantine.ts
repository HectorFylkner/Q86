import { and, eq, inArray } from "drizzle-orm";
import { db } from "./index.ts";
import { questions, settings } from "./schema.ts";

export const MODEL_QUARANTINE_MIGRATION_KEY =
  "model_quarantine_v1_applied" as const;

/**
 * One-time safety migration for databases created before human Question QA.
 * The marker and demotion share a transaction: either both commit or neither
 * does, and later boots cannot demote questions approved under the new gate.
 */
export async function applyModelQuarantineMigration(): Promise<number> {
  return db.transaction(async (tx) => {
    const claimed = await tx
      .insert(settings)
      .values({
        key: MODEL_QUARANTINE_MIGRATION_KEY,
        value: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .returning({ key: settings.key })
      .get();
    if (!claimed) return 0;

    const quarantined = await tx
      .update(questions)
      .set({ verified: false })
      .where(
        and(
          eq(questions.verified, true),
          inArray(questions.source, ["generated", "twin"]),
        ),
      )
      .returning({ id: questions.id })
      .all();
    return quarantined.length;
  });
}
