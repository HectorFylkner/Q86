/**
 * DEVELOPMENT ONLY — the before/after instrument.
 *
 * Screenshots every route at three widths in both themes, into a
 * gitignored directory, so a design change can be shown rather than
 * described. Run it before a workstream and again after; the two
 * directories are the evidence.
 *
 * Chromium ships preinstalled in this environment
 * (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers) — do not run
 * `playwright install`.
 *
 * Usage:
 *   node scripts/capture.mjs --out=screenshots/baseline
 *   node scripts/capture.mjs --out=screenshots/w2 --base=http://localhost:3000
 *   node scripts/capture.mjs --out=… --only=/analytics,/mastery
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = (name, fallback) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const OUT = path.resolve(arg("out", "screenshots/latest"));
const ONLY = arg("only", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const FULL_PAGE = !args.includes("--viewport-only");
const MAX_FULLPAGE_PX = Number(arg("max-height", "5200"));

/** Every route worth photographing, with the label used in filenames.
 *  Dynamic routes are captured through a representative instance. */
const ROUTES = [
  ["today", "/"],
  ["learn", "/learn"],
  ["learn-chapter", "/learn/percent_change_chains"],
  ["learn-technique", "/learn/technique-backsolve"],
  ["drill", "/drill"],
  ["timed", "/timed"],
  ["deck", "/deck"],
  ["queue", "/queue"],
  ["patterns", "/patterns"],
  ["decide", "/decide"],
  ["mastery", "/mastery"],
  ["analytics", "/analytics"],
  ["import", "/import"],
];

const VIEWPORTS = [
  ["390", 390, 844],
  ["768", 768, 1024],
  ["1280", 1280, 900],
];

const THEMES = ["light", "dark"];

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  for (;;) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
    }
    await new Promise((r) => setTimeout(r, 700));
  }
}

const routes = ONLY.length
  ? ROUTES.filter(([, href]) => ONLY.includes(href))
  : ROUTES;

await waitForServer(BASE);
fs.mkdirSync(OUT, { recursive: true });

/** The preinstalled Chromium may not match the build this Playwright
 *  release would download, so point at it explicitly rather than fetching
 *  another copy. */
function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!fs.existsSync(root)) return undefined;
  const candidates = fs
    .readdirSync(root)
    .filter((d) => d.startsWith("chromium-"))
    .sort()
    .reverse()
    .map((d) => path.join(root, d, "chrome-linux", "chrome"));
  return candidates.find((p) => fs.existsSync(p));
}

const executablePath = findChromium();
const browser = await chromium.launch(
  executablePath ? { executablePath } : undefined,
);
const failures = [];
const trimmed = [];
let shots = 0;

for (const theme of THEMES) {
  for (const [vpName, width, height] of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      colorScheme: theme,
      reducedMotion: "reduce",
      isMobile: width < 700,
      hasTouch: width < 700,
    });
    // The app persists the theme choice in localStorage; set it explicitly
    // so the capture never depends on which toggle state was left behind.
    await context.addInitScript((t) => {
      try {
        window.localStorage.setItem("q86-theme", t);
      } catch {
        /* storage may be unavailable */
      }
      document.documentElement.setAttribute("data-theme", t);
    }, theme);

    const page = await context.newPage();
    for (const [label, href] of routes) {
      const file = path.join(OUT, `${label}__${vpName}__${theme}.png`);
      try {
        const res = await page.goto(`${BASE}${href}`, {
          waitUntil: "networkidle",
          timeout: 45_000,
        });
        if (res && res.status() >= 400) {
          failures.push(`${href} → HTTP ${res.status()}`);
        }
        // Charts mount and animate on the client; give them a beat.
        await page.waitForTimeout(700);
        // Very tall pages (the redo queue lists every open item) exceed
        // what a full-page capture can rasterize at 2×; cap them so the
        // instrument never silently fails on the page most worth seeing.
        const scrollHeight = await page.evaluate(
          () => document.documentElement.scrollHeight,
        );
        const capped = FULL_PAGE && scrollHeight > MAX_FULLPAGE_PX;
        await page.screenshot({
          path: file,
          ...(capped
            ? { clip: { x: 0, y: 0, width, height: MAX_FULLPAGE_PX } }
            : { fullPage: FULL_PAGE }),
          animations: "disabled",
          timeout: 90_000,
        });
        if (capped) trimmed.push(`${label}@${vpName}/${theme} (${scrollHeight}px)`);
        shots++;
      } catch (err) {
        failures.push(`${href} @${vpName}/${theme}: ${err.message.split("\n")[0]}`);
      }
    }
    await context.close();
  }
}

await browser.close();

console.log(
  `✓ ${shots} screenshots → ${path.relative(process.cwd(), OUT)} ` +
    `(${routes.length} routes × ${VIEWPORTS.length} widths × ${THEMES.length} themes)`,
);
if (trimmed.length) {
  console.log(
    `  ${trimmed.length} page(s) taller than ${MAX_FULLPAGE_PX}px captured top-down: ${trimmed.join(", ")}`,
  );
}
if (failures.length) {
  console.error(`\n✗ ${failures.length} problems:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
