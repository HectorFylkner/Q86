/**
 * DEVELOPMENT ONLY — sit one miss, override the suggestion, read the database.
 *
 * W13's whole claim is that an override is now recoverable from history. A
 * unit test cannot check that: the suggestion is computed in a server action,
 * shown by a client component, and written by a third module, and the failure
 * mode that shipped for three sessions was precisely that the three did not
 * add up to a stored fact. So this drives the production build in a real
 * browser — start a drill, answer wrong on purpose, read the suggestion off
 * the page, press a *different* error-type key — and then reads the row back
 * out of SQLite and prints what is actually there.
 *
 * Prints PASS only if the stored row shows the suggestion that was on screen
 * *and* a different final tag. Exits non-zero otherwise.
 *
 * Usage: pnpm build && pnpm start &   then
 *        node scripts/observe-override.mjs [--base=http://localhost:3000]
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createClient } from "@libsql/client";

const args = process.argv.slice(2);
const arg = (n, d) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");

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
const before = await db.execute("select max(id) as id from attempts");
const highWater = Number(before.rows[0].id ?? 0);

const executablePath = findChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : undefined);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const steps = [];
const step = (ok, label, detail = "") => {
  steps.push({ ok, label, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
};

try {
  await page.goto(`${BASE}/drill`, { waitUntil: "networkidle" });
  step(true, "opened /drill");

  // Start whatever drill the setup screen offers, then answer the first
  // question with a deliberately wrong choice so the panel appears.
  const start = page.getByRole("button", { name: /start drill/i }).first();
  await start.click();
  await page.waitForSelector("[data-choice], button:has-text('A')", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);

  // Pick a choice, set confidence, submit — all through the documented keys.
  await page.keyboard.press("1");
  await page.keyboard.press("l");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2500);
  step(true, "answered the first question");

  const panel = page.getByRole("region", { name: /why this one was missed/i });
  const visible = await panel.isVisible().catch(() => false);
  if (!visible) {
    step(false, "the attribution panel did not appear (the answer was correct)");
    throw new Error("need a miss — rerun; choice 1 happened to be the key");
  }
  step(true, "the attribution panel appeared");

  // Read the suggestion the page is actually showing.
  const suggestedLabel = await panel
    .locator("button:has-text('suggested')")
    .first()
    .innerText()
    .catch(() => "");
  const suggested = suggestedLabel.replace(/^\d+\s*/, "").replace(/\s*suggested\s*$/i, "").trim();
  step(Boolean(suggested), "read the suggestion off the page", suggested || "none shown");

  // Override it: press a key for a *different* error type.
  const ORDER = ["Content gap", "Setup error", "Calculation error", "Misread", "Time pressure", "Guess"];
  const suggestedIndex = ORDER.indexOf(suggested);
  const overrideIndex = suggestedIndex === 0 ? 1 : 0;
  await page.keyboard.press(String(overrideIndex + 1));
  await page.waitForTimeout(2000);
  step(true, `overrode it with "${ORDER[overrideIndex]}" (key ${overrideIndex + 1})`);

  // Read the row back out of the database.
  const after = await db.execute({
    sql: `select id, error_type, suggested_error_type, suggested_confidence, tagged_at
          from attempts where id > ? order by id desc limit 1`,
    args: [highWater],
  });
  const row = after.rows[0];
  if (!row) {
    step(false, "no new attempt row was written");
  } else {
    console.log("\n  stored row:");
    console.log(`    id                       ${row.id}`);
    console.log(`    error_type               ${row.error_type}`);
    console.log(`    suggested_error_type     ${row.suggested_error_type}`);
    console.log(
      `    suggested_confidence     ${row.suggested_confidence == null ? "null" : Number(row.suggested_confidence).toFixed(3)}`,
    );
    console.log(`    tagged_at                ${row.tagged_at ? new Date(Number(row.tagged_at)).toISOString() : "null"}\n`);

    const SLUGS = {
      "Content gap": "content_gap",
      "Setup error": "setup_error",
      "Calculation error": "calculation_error",
      Misread: "misread",
      "Time pressure": "time_pressure",
      Guess: "guess",
    };
    step(row.error_type === SLUGS[ORDER[overrideIndex]], "the final tag is the override");
    step(
      row.suggested_error_type === SLUGS[suggested],
      "the suggestion on screen is the suggestion stored",
      `page "${suggested}" → db "${row.suggested_error_type}"`,
    );
    step(row.suggested_error_type !== row.error_type, "the row reads as an override, not a first-time tag");
    step(row.tagged_at != null, "the tag is timestamped");
  }
} finally {
  await browser.close();
}

const failed = steps.filter((s) => !s.ok);
console.log("");
console.log(failed.length === 0 ? "PASS" : `FAIL — ${failed.length} step(s)`);
process.exit(failed.length === 0 ? 0 : 1);
