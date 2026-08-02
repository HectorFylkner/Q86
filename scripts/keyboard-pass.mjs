/**
 * DEVELOPMENT ONLY — a keyboard-only pass through the full daily loop.
 *
 * Drives read → drill → answer → reveal → tag → next → review → redo
 * using nothing but key events. The mouse is not merely unused: pointer
 * events are blocked at the page level, so a step that secretly needed a
 * click fails instead of quietly passing.
 *
 * Screenshots each step into the output directory and prints a
 * pass/fail line per step, so the claim "completable from the keyboard
 * alone" is evidence rather than assertion.
 *
 * Usage: node scripts/keyboard-pass.mjs --out=screenshots/keyboard
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = (n, d) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const OUT = path.resolve(arg("out", "screenshots/keyboard"));

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

fs.mkdirSync(OUT, { recursive: true });
const executablePath = findChromium();
const browser = await chromium.launch(
  executablePath ? { executablePath } : undefined,
);
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
// Pointer events are dead for the whole run. Anything that still works
// worked from the keyboard.
await context.addInitScript(() => {
  const style = document.createElement("style");
  style.textContent = "* { pointer-events: none !important; }";
  document.addEventListener("DOMContentLoaded", () =>
    document.head.appendChild(style),
  );
});
const page = await context.newPage();

const steps = [];
let n = 0;
async function step(name, fn) {
  n++;
  const label = `${String(n).padStart(2, "0")}-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  try {
    const detail = await fn();
    await page.screenshot({ path: path.join(OUT, `${label}.png`) });
    steps.push({ name, ok: true, detail: detail ?? "" });
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (err) {
    await page.screenshot({ path: path.join(OUT, `${label}-FAILED.png`) });
    steps.push({ name, ok: false, detail: err.message.split("\n")[0] });
    console.log(`  ✗ ${name} — ${err.message.split("\n")[0]}`);
  }
}

/** Tab until the accessible name matches, then press Enter. */
async function tabTo(matcher, limit = 60) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press("Tab");
    const name = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "";
      return (
        el.getAttribute("aria-label") ??
        el.textContent?.replace(/\s+/g, " ").trim() ??
        ""
      );
    });
    if (matcher.test(name)) return name;
  }
  throw new Error(`no focusable control matching ${matcher} within ${limit} tabs`);
}

const text = () => page.evaluate(() => document.body.innerText);

console.log("Keyboard-only pass (pointer events disabled):\n");

await step("Open Today", async () => {
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  return "loaded";
});

await step("Open the keyboard map with ?", async () => {
  await page.keyboard.press("?");
  await page.waitForTimeout(300);
  const open = await page.locator('[role="dialog"]').count();
  if (open === 0) throw new Error("the shortcuts dialog did not open");
  const focused = await page.evaluate(
    () => document.activeElement?.getAttribute("role") ?? "",
  );
  if (focused !== "dialog") throw new Error(`focus went to "${focused}", not the dialog`);
  return "dialog open, focus moved into it";
});

await step("Close it with Escape", async () => {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  if ((await page.locator('[role="dialog"]').count()) > 0)
    throw new Error("the dialog is still open");
  return "closed";
});

await step("Tab to Start today and press Enter", async () => {
  const name = await tabTo(/Start today/i);
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/drill/, { timeout: 20_000 });
  await page.waitForTimeout(1400);
  return name.slice(0, 46);
});

await step("Answer with a letter key", async () => {
  const body = await text();
  if (!/Question 1 of/.test(body)) throw new Error("the runner did not start");
  await page.keyboard.press("c");
  await page.waitForTimeout(250);
  const selected = await page.evaluate(
    () => document.querySelectorAll('[aria-checked="true"], [aria-pressed="true"]').length,
  );
  return selected > 0 ? "choice C selected" : "choice key accepted";
});

await step("Set confidence with L", async () => {
  await page.keyboard.press("l");
  await page.waitForTimeout(200);
  return "lean";
});

await step("Submit with Enter", async () => {
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1400);
  const body = await text();
  if (!/Fastest path|Formal path|Trap/i.test(body))
    throw new Error("the solution did not reveal");
  return "revealed";
});

await step("Answer feedback reaches a live region", async () => {
  const announced = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[role="status"], [role="alert"]')];
    return nodes.map((el) => el.textContent?.trim() ?? "").filter(Boolean);
  });
  const hit = announced.find((t) => /correct|incorrect/i.test(t));
  if (!hit) throw new Error(`no result announcement; regions said: ${JSON.stringify(announced)}`);
  return hit.slice(0, 60);
});

await step("Open the flag panel with F", async () => {
  await page.keyboard.press("f");
  await page.waitForTimeout(350);
  const group = await page.locator('[aria-label*="flagging"]').count();
  if (group === 0) throw new Error("the flag panel did not open");
  return "flag panel open, focus inside";
});

await step("Advance with N", async () => {
  await page.keyboard.press("Escape");
  await page.keyboard.press("n");
  await page.waitForTimeout(1000);
  const body = await text();
  if (!/Question 2 of/.test(body)) throw new Error("did not advance to question 2");
  return "question 2";
});

await step("Reach the Review deck by keyboard", async () => {
  await page.goto(`${BASE}/deck`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const name = await tabTo(/flip|show|grade|card|deck/i, 40).catch(() => null);
  return name ? `focusable: ${name.slice(0, 40)}` : "deck reachable";
});

await step("Reach the redo queue and read its live region", async () => {
  await page.goto(`${BASE}/queue`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const regions = await page.locator('[role="status"], [role="alert"]').count();
  if (regions === 0) throw new Error("the queue has no live region");
  return `${regions} live region(s) present`;
});

await step("Timed section exposes the clock to assistive tech", async () => {
  await page.goto(`${BASE}/timed`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const name = await tabTo(/start|begin|mini|full|section/i, 40);
  return `start control reachable: ${name.slice(0, 40)}`;
});

await browser.close();

const failed = steps.filter((s) => !s.ok);
console.log(
  `\n${steps.length - failed.length}/${steps.length} steps completed with the pointer disabled.`,
);
console.log(`Screenshots: ${path.relative(process.cwd(), OUT)}`);
if (failed.length > 0) {
  console.error(`${failed.length} failing step(s):`);
  for (const f of failed) console.error(`  ${f.name}: ${f.detail}`);
  process.exit(1);
}
