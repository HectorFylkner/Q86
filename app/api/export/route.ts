import { NextResponse } from "next/server";
import {
  NotAuthenticatedError,
  requireScoped,
} from "@/lib/auth/session";
import {
  attempts,
  baselineReports,
  deckReviews,
  edits,
  eloRatings,
  patternAttempts,
  questionFlags,
  redoQueue,
  sessions,
  settings,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Everything Q86 holds about the signed-in account, as a downloadable JSON
 * file. This is both the personal backup and the GDPR article 20 export
 * that `/integritetspolicy` promises (M4).
 *
 * Two deliberate boundaries:
 *   - Only the caller's rows. Before M1 this endpoint dumped the whole
 *     database, which in a multi-tenant deployment would be every
 *     subscriber's history.
 *   - The question bank is not included. A user's personal data is their
 *     attempts, not the 360 verified questions those attempts point at, and
 *     shipping the bank to anyone with a free account would hand over the
 *     product. Question ids are exported so the export is still joinable
 *     against a restored instance.
 */
export async function GET() {
  let scope;
  try {
    scope = await requireScoped();
  } catch (e) {
    if (e instanceof NotAuthenticatedError) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    throw e;
  }
  const { user, sdb } = scope;

  const [
    sessionRows,
    attemptRows,
    editRows,
    redoRows,
    patternRows,
    eloRows,
    baselineRows,
    settingRows,
    deckReviewRows,
    flagRows,
  ] = await Promise.all([
    sdb.rows(sessions),
    sdb.rows(attempts),
    sdb.rows(edits),
    sdb.rows(redoQueue),
    sdb.rows(patternAttempts),
    sdb.rows(eloRatings),
    sdb.rows(baselineReports),
    sdb.rows(settings),
    sdb.rows(deckReviews),
    sdb.rows(questionFlags),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    format: "q86-account-export-v2",
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale,
      created_at: user.createdAt.toISOString(),
    },
    counts: {
      sessions: sessionRows.length,
      attempts: attemptRows.length,
      edits: editRows.length,
      redo_queue: redoRows.length,
      pattern_attempts: patternRows.length,
      elo_ratings: eloRows.length,
      baseline_reports: baselineRows.length,
      settings: settingRows.length,
      deck_reviews: deckReviewRows.length,
      question_flags: flagRows.length,
    },
    tables: {
      sessions: sessionRows,
      attempts: attemptRows,
      edits: editRows,
      redo_queue: redoRows,
      pattern_attempts: patternRows,
      elo_ratings: eloRows,
      baseline_reports: baselineRows,
      settings: settingRows,
      deck_reviews: deckReviewRows,
      question_flags: flagRows,
    },
    // Referenced bank items, by id only — see the note above.
    referenced_question_ids: [
      ...new Set(attemptRows.map((a) => a.questionId)),
    ].sort((a, b) => a - b),
  };

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="q86-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
