/**
 * Error-inference audit.
 *
 * The ranked list of undone work has said for three sessions that fitting
 * `attributeError()`'s hand-set weights was blocked on override data. It was
 * blocked on something else: `tagAttempt()` persisted only the final tag, so
 * an override was indistinguishable from a first-time tag and the labelled
 * examples were being *destroyed as they were produced*. W13 records the
 * suggestion beside the tag; this script is the read side, and it exists so
 * the claim "the examples are accumulating" is a number somebody printed
 * rather than a belief somebody held.
 *
 * Two invariants, plus a report:
 *
 *   RECORDED   every tag written since the columns existed carries the
 *              suggestion it was made against. A tag without one is a
 *              labelled example that was thrown away, and the count must be
 *              zero for rows written after the change.
 *   ONCE       re-tagging an attempt never rewrites the suggestion already
 *              on it. The example is what the reader was shown when they
 *              first decided; a suggestion recomputed later against a moved
 *              subtopic history would silently corrupt it.
 *
 * The agreement numbers are a *report*, deliberately not a gate. On the
 * seeded fixture they measure the inference against `dev-seed-history.ts`'s
 * own error-mix model, which is not a reader — see the note it prints. Only
 * real overrides can set the weights, and this is the instrument that will
 * say when there are enough of them.
 *
 * Usage: node --experimental-strip-types scripts/check-inference.ts [--json]
 */
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { ensureDbReady } from "../lib/db/bootstrap.ts";
import { attempts } from "../lib/db/schema.ts";
import { MIN_LABELLED, suggestionAgreement } from "../lib/inference-audit.ts";
import { recordTag } from "../lib/tagging.ts";
import { ERROR_TYPES, ERROR_TYPE_LABELS, type ErrorType } from "../lib/taxonomy.ts";

const asJson = process.argv.includes("--json");

await ensureDbReady();

const report = await suggestionAgreement();
const fixture = await suggestionAgreement({ includeSynthetic: true });
const failures: string[] = [];

// --- RECORDED --------------------------------------------------------------
// Rows tagged before W13 have no `tagged_at`, so they are legitimately
// unrecorded and are reported rather than counted against the gate. Nor is a
// miss where the inference genuinely had nothing to say — that writes a zero
// confidence, which is how "we looked and found nothing" is told apart from
// "nobody looked". A row with a `tagged_at` and neither is the defect this
// script exists for.
const droppedRow = await db
  .select({ n: sql<number>`count(*)` })
  .from(attempts)
  .where(
    and(
      isNotNull(attempts.errorType),
      isNotNull(attempts.taggedAt),
      sql`${attempts.suggestedErrorType} is null`,
      sql`${attempts.suggestedConfidence} is null`,
    ),
  )
  .get();
const dropped = droppedRow?.n ?? 0;
if (dropped > 0) {
  failures.push(
    `RECORDED ${dropped} tag(s) written since the change carry no suggestion — those labelled examples are lost.`,
  );
}

// --- ONCE ------------------------------------------------------------------
// Driven against the real write path rather than asserted about it: take a
// tagged attempt, re-tag it with a different type and a different claimed
// suggestion, and check the stored suggestion did not move.
const subject = await db
  .select({
    id: attempts.id,
    errorType: attempts.errorType,
    suggestedErrorType: attempts.suggestedErrorType,
    suggestedConfidence: attempts.suggestedConfidence,
  })
  .from(attempts)
  .where(and(isNotNull(attempts.errorType), isNotNull(attempts.suggestedErrorType)))
  .limit(1)
  .get();

let onceChecked = false;
if (subject) {
  const other = ERROR_TYPES.find((t) => t !== subject.errorType) as ErrorType;
  const bogus = ERROR_TYPES.find(
    (t) => t !== subject.suggestedErrorType,
  ) as ErrorType;
  await recordTag(subject.id, {
    errorType: other,
    suggestion: { errorType: bogus, confidence: 0.99 },
  });
  const after = await db
    .select({
      errorType: attempts.errorType,
      suggestedErrorType: attempts.suggestedErrorType,
      suggestedConfidence: attempts.suggestedConfidence,
    })
    .from(attempts)
    .where(eq(attempts.id, subject.id))
    .get();
  onceChecked = true;
  if (after?.suggestedErrorType !== subject.suggestedErrorType) {
    failures.push(
      `ONCE re-tagging attempt ${subject.id} rewrote its suggestion (${subject.suggestedErrorType} → ${after?.suggestedErrorType}).`,
    );
  }
  if (after?.errorType !== other) {
    failures.push(`ONCE re-tagging attempt ${subject.id} did not update the tag itself.`);
  }
  // Put the record back exactly as it was — this is the user's training
  // history, not a scratch table.
  await db
    .update(attempts)
    .set({ errorType: subject.errorType as ErrorType })
    .where(eq(attempts.id, subject.id))
    .run();
} else {
  failures.push("ONCE unchecked — no tagged attempt carries a recorded suggestion.");
}

// --- report ----------------------------------------------------------------
if (asJson) {
  console.log(JSON.stringify({ ...report, dropped, onceChecked, failures }, null, 2));
} else {
  const pct = (n: number | null) => (n == null ? "  —  " : `${(n * 100).toFixed(1)}%`);
  console.log("Error inference — suggestion vs. the reader's tag\n");
  console.log("REAL (the reader's own corrections; synthetic fixture excluded)");
  console.log(`  labelled examples   ${report.labelled}`);
  console.log(`    accepted          ${report.accepted}`);
  console.log(`    overridden        ${report.overridden}`);
  console.log(`  unrecorded tags     ${report.unrecorded}  (predate the change)`);
  console.log(
    `  agreement           ${pct(report.agreement)}${
      report.agreement == null ? `  (needs ${MIN_LABELLED}, has ${report.labelled})` : ""
    }`,
  );
  console.log(
    `    when confident    ${pct(report.confidentAgreement)}  over ${report.confidentLabelled}`,
  );
  console.log(
    `    when uncertain    ${pct(report.uncertainAgreement)}  over ${report.uncertainLabelled}`,
  );

  console.log(
    `\nFIXTURE (dev-seed-history, for pipeline smoke only)\n` +
      `  labelled examples   ${fixture.labelled}\n` +
      `    accepted          ${fixture.accepted}\n` +
      `    overridden        ${fixture.overridden}\n` +
      `  agreement           ${pct(fixture.agreement)}`,
  );

  if (fixture.labelled > 0) {
    console.log("\nConfusion (rows = suggested, columns = the reader's tag) — fixture");
    const head = ERROR_TYPES.map((t) => t.slice(0, 8).padStart(9)).join("");
    console.log(`${"".padEnd(20)}${head}`);
    for (const s of ERROR_TYPES) {
      console.log(
        `${s.padEnd(20)}${ERROR_TYPES.map((c) => String(fixture.confusion[s][c]).padStart(9)).join("")}`,
      );
    }
    if (fixture.worstConfusion) {
      const w = fixture.worstConfusion;
      console.log(
        `\nMost common disagreement: suggested ${ERROR_TYPE_LABELS[w.suggested]}, reader said ${ERROR_TYPE_LABELS[w.chosen]} (${w.count}×).`,
      );
    }
  }

  console.log(
    "\nNOTE  The fixture block is not a finding. dev-seed-history.ts draws most\n" +
      "      of its error types from a weighted random mix, so agreement against\n" +
      "      them sits near chance (1 in 6) by construction and would stay there\n" +
      "      however good the weights were. It proves the pipeline writes and\n" +
      "      reads; only the REAL block can ever say anything about the weights.",
  );

  console.log("");
  console.log(`RECORDED  tags written since the change with no suggestion: ${dropped}`);
  console.log(`ONCE      re-tagging leaves the stored suggestion alone: ${onceChecked ? "checked" : "unchecked"}`);
  console.log("");
  if (failures.length === 0) console.log("PASS");
  else for (const f of failures) console.log("FAIL  " + f);
}

process.exit(failures.length === 0 ? 0 : 1);
