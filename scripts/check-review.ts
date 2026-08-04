/**
 * Cumulative-review audit.
 *
 * The review's whole claim is that it is *interleaved* and *at the level
 * the chapter was proved at*. Both are properties of the set that actually
 * gets served, not of the code that builds it, so this measures the served
 * set:
 *
 *   INTERLEAVED   no two consecutive questions from the same chapter,
 *                 measured against `minPossibleRun` so the bar is what
 *                 was achievable rather than an unconditional 1
 *   CEILING       no question harder than the tier its chapter cleared
 *   DISTINCT      no question served twice in one review
 *   LADDER        a chapter that keeps passing is asked less often
 *   OUTCOME       what the result screen tells the reader it changed is
 *                 what the schedule actually did — read back from the same
 *                 replay the scheduler runs, over a real finished session
 *
 * Usage: node --experimental-strip-types scripts/check-review.ts
 */
import { chapterTestStates } from "../lib/chapter-tests.ts";
import {
  chapterReviewStates,
  reviewOutcome,
  reviewPlan,
  selectCumulativeReview,
} from "../lib/cumulative.ts";
import { db } from "../lib/db/index.ts";
import { sessions } from "../lib/db/schema.ts";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import {
  CHAPTER_REVIEW_STAGE_DAYS,
  REVIEW_PER_CHAPTER,
  daysOverdue,
  nextChapterReviewStage,
  type ChapterReviewStage,
} from "../lib/cumulative-config.ts";
import { longestRun, minPossibleRun } from "../lib/interleave.ts";

const failures: string[] = [];
const now = Date.now();

const tests = await chapterTestStates();
const passed = Object.entries(tests).filter(([, s]) => s?.passed);
const states = await chapterReviewStates();
const plan = await reviewPlan(now);

console.log("Cumulative-review audit\n");
console.log(`chapters with a test record : ${Object.keys(tests).length}`);
console.log(`chapters passed             : ${passed.length}`);
console.log(`in the review rotation      : ${states.length}`);
console.log("");

if (states.length === 0) {
  console.log(
    "No chapter has been passed yet, so there is nothing to review.\n" +
      "Pass a chapter test (both required tiers) and it enters the rotation.",
  );
  console.log("\nSKIPPED — no rotation to audit");
  process.exit(0);
}

// OUTCOME — over the most recent *finished* review, check that the movement
// the card reports is the movement the ladder rule produces from the same
// slice, and that the interval printed is the one the chapter now sits on.
// This is the property W14 adds: the mechanism was already right, but the
// reader was never told, and a sentence that drifts from the schedule is
// worse than no sentence.
const lastReview = (
  await db
    .select({ id: sessions.id, config: sessions.config, summary: sessions.summary })
    .from(sessions)
    .where(and(eq(sessions.mode, "drill"), isNotNull(sessions.endedAt)))
    .orderBy(desc(sessions.id))
    .all()
).find((r) => (r.config as { cumulative_review?: boolean })?.cumulative_review);

if (!lastReview) {
  console.log(
    "OUTCOME      no finished review in the database yet — run one and re-check",
  );
} else {
  const outcome = (await reviewOutcome(lastReview.id)) ?? [];
  const after = new Map(
    (await chapterReviewStates()).map((s) => [s.subtopic, s]),
  );
  let wrong = 0;
  for (const o of outcome) {
    const expectedStage = nextChapterReviewStage(o.stageBefore, o.correct, o.total);
    const expectedMovement =
      expectedStage > o.stageBefore ? "advanced" : o.correct === 0 ? "reset" : "held";
    if (o.stageAfter !== expectedStage) {
      wrong++;
      failures.push(
        `${o.subtopic}: card says rung ${o.stageAfter}, the rule gives ${expectedStage}`,
      );
    }
    if (o.movement !== expectedMovement) {
      wrong++;
      failures.push(
        `${o.subtopic}: card says "${o.movement}", the rule gives "${expectedMovement}"`,
      );
    }
    if (o.intervalDays !== CHAPTER_REVIEW_STAGE_DAYS[after.get(o.subtopic)!.stage]) {
      wrong++;
      failures.push(`${o.subtopic}: the interval printed is not the one it sits on`);
    }
  }
  console.log(
    `OUTCOME      ${outcome.length} chapter(s) reported, ${wrong} disagreement(s) with the ladder`,
  );
  for (const o of outcome) {
    console.log(
      `             ${o.subtopic.padEnd(30)} ${o.correct}/${o.total}  ${o.movement.padEnd(9)} ` +
        `${CHAPTER_REVIEW_STAGE_DAYS[o.stageBefore]}d → ${CHAPTER_REVIEW_STAGE_DAYS[o.stageAfter]}d`,
    );
  }
}

console.log("chapter".padEnd(30) + "stage  interval  overdue  ceiling");
for (const s of states.sort((a, b) => a.subtopic.localeCompare(b.subtopic))) {
  console.log(
    s.subtopic.padEnd(30) +
      String(s.stage).padStart(5) +
      `${CHAPTER_REVIEW_STAGE_DAYS[s.stage]}d`.padStart(10) +
      `${daysOverdue(s, now)}d`.padStart(9) +
      `D${s.ceiling}`.padStart(9),
  );
}

console.log("");
console.log(
  `plan: ${plan.available ? "available" : "not due"} — ${plan.chapters.length} chapters, ${plan.questions} questions, ${plan.waiting} waiting`,
);

if (!plan.available) {
  console.log(
    "\nNothing is due right now, so the served-set invariants cannot be measured.",
  );
  // OUTCOME has already run against history, so its verdict still counts —
  // exiting 0 here would swallow a real disagreement whenever the reader had
  // just finished a review, which is precisely when one would appear.
  if (failures.length) {
    for (const f of failures) console.log(`  ✗ ${f}`);
    console.log("FAIL");
    process.exit(1);
  }
  console.log("\nSKIPPED — no review due (OUTCOME checked against history)");
  process.exit(0);
}

const { questions, chapters } = await selectCumulativeReview(now);
const ceilingOf = new Map(states.map((s) => [s.subtopic, s.ceiling]));

console.log("");
console.log("served set, in order:");
questions.forEach((q, i) => {
  console.log(
    `  ${String(i + 1).padStart(2)}. ${q.subtopic.padEnd(30)} D${q.difficulty}`,
  );
});

// INTERLEAVED
const sizes = chapters.map(
  (c) => questions.filter((q) => q.subtopic === c).length,
);
const run = longestRun(questions, (q) => q.subtopic);
const floor = minPossibleRun(sizes);
console.log("");
console.log(
  `INTERLEAVED  longest same-chapter run ${run} (floor for sizes [${sizes}] is ${floor})`,
);
if (run > floor) {
  failures.push(`longest run ${run} exceeds the achievable floor ${floor}`);
}

// CEILING
let overCeiling = 0;
for (const q of questions) {
  const ceiling = ceilingOf.get(q.subtopic);
  if (ceiling == null || q.difficulty > ceiling) overCeiling++;
}
console.log(
  `CEILING      questions above the tier their chapter cleared: ${overCeiling}`,
);
if (overCeiling > 0) failures.push(`${overCeiling} questions above the ceiling`);

// DISTINCT
const ids = questions.map((q) => q.id);
console.log(
  `DISTINCT     ${new Set(ids).size} distinct of ${ids.length} served`,
);
if (new Set(ids).size !== ids.length) failures.push("a question was served twice");

// SIZE
const expected = chapters.length * REVIEW_PER_CHAPTER;
console.log(`SIZE         ${questions.length} served, ${expected} expected`);
if (questions.length !== expected) {
  failures.push(`served ${questions.length}, expected ${expected}`);
}

// LADDER — walk one chapter forward through three clean reviews.
let stage: ChapterReviewStage = states[0].stage;
const gaps: number[] = [];
for (let i = 0; i < 3; i++) {
  gaps.push(CHAPTER_REVIEW_STAGE_DAYS[stage]);
  stage = nextChapterReviewStage(stage, REVIEW_PER_CHAPTER, REVIEW_PER_CHAPTER);
}
console.log(`LADDER       three clean reviews space it ${gaps.join("d → ")}d`);
for (let i = 1; i < gaps.length; i++) {
  if (gaps[i] <= gaps[i - 1]) failures.push("intervals did not grow");
}

console.log("");
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log("FAIL");
  process.exit(1);
}
console.log("PASS");
