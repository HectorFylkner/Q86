import { db } from "@/lib/db";
import {
  attempts,
  baselineReports,
  deckReviews,
  edits,
  eloRatings,
  patternAttempts,
  questionFlags,
  questions,
  redoQueue,
  sessions,
  settings,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** Full-database backup as a downloadable JSON file. Everything the
 *  platform knows lives in these tables, so restoring is a re-import. */
export async function GET() {
  const [
    questionRows,
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
    db.select().from(questions).all(),
    db.select().from(sessions).all(),
    db.select().from(attempts).all(),
    db.select().from(edits).all(),
    db.select().from(redoQueue).all(),
    db.select().from(patternAttempts).all(),
    db.select().from(eloRatings).all(),
    db.select().from(baselineReports).all(),
    db.select().from(settings).all(),
    db.select().from(deckReviews).all(),
    db.select().from(questionFlags).all(),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    format: "q86-backup-v1",
    counts: {
      questions: questionRows.length,
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
      questions: questionRows,
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
  };

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="q86-backup-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
