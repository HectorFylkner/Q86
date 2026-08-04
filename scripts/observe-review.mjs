/**
 * DEVELOPMENT ONLY — sit a cumulative review, and check the page tells the
 * truth about what it changed.
 *
 * W10 proved the *mechanism*: each chapter's spacing rung moves on its own
 * slice of the result. W14's claim is different and cannot be unit-tested —
 * that the reader is now *told*, on Today before the review and on the result
 * screen after it, and that what they are told matches the schedule that is
 * actually running. Both are things the page says, conditional on render
 * state, which is exactly where the last two live defects were found.
 *
 * So this drives the production build: read the Today card, start the review
 * from it, answer every question, then read the "What this changed" card off
 * the rendered page and compare it line by line against what
 * `reviewOutcome()` reports from the database.
 *
 * `--correct` answers every question right, so the "moved further out"
 * branch of the copy gets looked at too rather than assumed. The key is found
 * by matching the five choices on screen against the bank — the page never
 * reveals it, so this reads it the same way an auditor would.
 *
 * Usage: pnpm build && pnpm start &   then
 *        node scripts/observe-review.mjs [--base=http://localhost:3000]
 *                                        [--correct]
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createClient } from "@libsql/client";

const args = process.argv.slice(2);
const arg = (n, d) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const ANSWER_CORRECTLY = args.includes("--correct");

function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!fs.existsSync(root)) return undefined;
  return fs
    .readdirSync(root)
    .filter((d) => d.startsWith("chromium-"))
    .sort()
    .reverse()
    .map((d) => path.join(root, d, "chrome-linux", "chrome"))
    .find((p) => fs.existsSync(p));
}

const db = createClient({ url: "file:./data/q86.db" });
const steps = [];
const step = (ok, label, detail = "") => {
  steps.push({ ok, label, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
};

// The bank, keyed by the prose of its stem, so the question on screen can be
// identified without the page ever exposing its answer. Maths is stripped from
// both sides: the page renders LaTeX through KaTeX, so only the words survive
// the round trip, and the words are more than enough to be unique.
const bank = new Map();
for (const row of (await db.execute("select stem_md, correct_index from questions")).rows) {
  bank.set(proseKey(String(row.stem_md)), Number(row.correct_index));
}
function proseKey(text) {
  return text
    .replace(/\$[^$]*\$/g, " ")
    .replace(/[^a-zA-Z ]+/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 12)
    .join(" ");
}

const executablePath = findChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : undefined);
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

try {
  // --- 1. the review is reachable from Today ------------------------------
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const todayCard = page.getByRole("heading", { name: /due for review/i }).first();
  const onToday = await todayCard.isVisible().catch(() => false);
  step(onToday, "the review is offered on Today", onToday ? await todayCard.innerText() : "no card");
  if (!onToday) throw new Error("no review due — reseed the fixture and retry");

  const startFromToday = page.getByRole("link", { name: /^Review \d+ questions? →$/ }).first();
  await startFromToday.click();
  await page.waitForURL(/\/drill\?review=1/, { timeout: 15000 });
  step(true, "Today's button starts the review", page.url());

  // --- 2. answer every question ------------------------------------------
  await page.waitForTimeout(2500);
  let answered = 0;
  for (let i = 0; i < 12; i++) {
    const done = await page
      .getByRole("heading", { name: /what this changed/i })
      .isVisible()
      .catch(() => false);
    if (done) break;

    let choice = 1 + (i % 5);
    if (ANSWER_CORRECTLY) {
      // The stem is the text of the question card above its choices; cut at
      // the first choice line so the answer letters never enter the key.
      const cardText = await page
        .locator("[role='radiogroup']")
        .first()
        .locator("xpath=ancestor::div[contains(@class,'rounded-card')][1]")
        .innerText()
        .catch(() => "");
      const stem = cardText.split(/\n[A-E][\s\n]/)[0];
      const idx = bank.get(proseKey(stem));
      if (idx != null) choice = idx + 1;
      else console.log(`    (could not identify question ${i + 1}; guessing)`);
    }
    await page.keyboard.press(String(choice));
    await page.keyboard.press("l");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1200);
    await page.keyboard.press("n");
    await page.waitForTimeout(900);
    answered++;
  }
  step(answered > 0, `answered ${answered} question(s)`);

  // --- 3. the result screen says what moved ------------------------------
  await page.waitForTimeout(2500);
  const card = page.locator("section", { has: page.getByRole("heading", { name: /what this changed/i }) }).first();
  const visible = await card.isVisible().catch(() => false);
  step(visible, "the 'What this changed' card rendered");
  if (!visible) throw new Error("no outcome card");

  const cardText = (await card.innerText()).replace(/\s+/g, " ").trim();
  console.log(`\n  card says:\n    ${cardText.slice(0, 460)}\n`);

  // --- 4. compare with the database --------------------------------------
  const row = (
    await db.execute(
      `select id, config, summary from sessions
       where mode = 'drill' and ended_at is not null
       order by id desc limit 20`,
    )
  ).rows.find((r) => {
    try {
      return JSON.parse(r.config)?.cumulative_review === true;
    } catch {
      return false;
    }
  });
  step(Boolean(row), "the session is recorded as a cumulative review", row ? `session ${row.id}` : "");

  const summary = JSON.parse(row.summary ?? "{}");
  const bySubtopic = summary.bySubtopic ?? {};
  console.log("  database says:");
  for (const [subtopic, cell] of Object.entries(bySubtopic)) {
    console.log(`    ${subtopic.padEnd(30)} ${cell.correct}/${cell.total}`);
  }
  console.log("");

  // Every chapter in the session must be named on the card, with its slice.
  let missing = 0;
  for (const [subtopic, cell] of Object.entries(bySubtopic)) {
    const slice = `${cell.correct}/${cell.total}`;
    if (!cardText.includes(slice)) missing++;
  }
  step(missing === 0, "every chapter's slice appears on the card", `${Object.keys(bySubtopic).length} chapters`);

  // The card must name an interval for each chapter — the thing that was
  // invisible before this workstream.
  const intervals = cardText.match(/back in \d+d/g) ?? [];
  step(
    intervals.length === Object.keys(bySubtopic).length,
    "each chapter is given a next interval",
    intervals.join(", ") || "none",
  );

  // And it must state the rule, so the schedule is learnable.
  step(/all correct moves a chapter one rung further out/i.test(cardText), "the rule is stated on the card");
} finally {
  await browser.close();
}

const failed = steps.filter((s) => !s.ok);
console.log(failed.length === 0 ? "PASS" : `FAIL — ${failed.length} step(s)`);
process.exit(failed.length === 0 ? 0 : 1);
