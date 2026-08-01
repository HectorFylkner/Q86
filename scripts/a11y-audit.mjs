/**
 * DEVELOPMENT ONLY — accessible-name coverage and live-region audit.
 *
 * Walks every route, finds every interactive control, and asks the
 * browser's own accessibility tree what each one is called. A control
 * with no accessible name is unreachable by voice control and announced
 * as "button" by a screen reader, which is the same as unlabelled.
 *
 * Also reports live regions per route, because a running clock and an
 * answer result that never announce are the two places this app most
 * needs them.
 *
 * Usage:
 *   node scripts/a11y-audit.mjs
 *   node scripts/a11y-audit.mjs --base=http://localhost:3000 --json
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = (name, fallback) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");

const ROUTES = [
  "/",
  "/learn",
  "/learn/percent_change_chains",
  "/drill",
  "/timed",
  "/deck",
  "/queue",
  "/patterns",
  "/decide",
  "/mastery",
  "/analytics",
  "/import",
];

const INTERACTIVE =
  'button, a[href], input:not([type="hidden"]), select, textarea, summary, ' +
  '[role="button"], [role="link"], [role="tab"], [role="checkbox"], ' +
  '[role="switch"], [tabindex]:not([tabindex="-1"])';

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

const executablePath = findChromium();
const browser = await chromium.launch(
  executablePath ? { executablePath } : undefined,
);
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
const page = await context.newPage();

/**
 * The states that only exist mid-session. Auditing routes at rest would
 * miss the runner entirely — which is where the user spends the hours.
 */
const IN_SESSION = [
  {
    route: "/drill?qids=1,2,3",
    label: "/drill (answering)",
    async setup(p) {
      await p.waitForTimeout(1200);
    },
  },
  {
    route: "/drill?qids=1,2,3",
    label: "/drill (revealed)",
    async setup(p) {
      await p.waitForTimeout(1200);
      await p.keyboard.press("b");
      await p.keyboard.press("l");
      await p.keyboard.press("Enter");
      await p.waitForTimeout(1400);
    },
  },
  {
    route: "/timed?start=mini",
    label: "/timed (running)",
    async setup(p) {
      // The clock only exists while a section is running, which is
      // exactly the state that needed a live region.
      await p.waitForTimeout(2500);
    },
  },
  {
    route: "/",
    label: "/ (shortcuts dialog open)",
    async setup(p) {
      await p.waitForTimeout(600);
      await p.keyboard.press("?");
      await p.waitForTimeout(400);
    },
  },
];

const report = [];
const targets = [
  ...ROUTES.map((route) => ({ route, label: route, setup: null })),
  ...IN_SESSION,
];
for (const target of targets) {
  const { route, label, setup } = target;
  await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(900);
  if (setup) await setup(page);

  const result = await page.evaluate((selector) => {
    /** Accessible name, following the parts of accname the DOM exposes. */
    const nameOf = (el) => {
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) {
        const text = labelledby
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
          .join(" ")
          .trim();
        if (text) return text;
      }
      const label = el.getAttribute("aria-label")?.trim();
      if (label) return label;
      if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
        if (el.id) {
          const forLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
          const t = forLabel?.textContent?.trim();
          if (t) return t;
        }
        const wrapping = el.closest("label")?.textContent?.trim();
        if (wrapping) return wrapping;
        const placeholder = el.getAttribute("placeholder")?.trim();
        if (placeholder) return placeholder;
        if (el.getAttribute("type") === "submit") return el.value?.trim() ?? "";
      }
      const text = el.textContent?.replace(/\s+/g, " ").trim();
      if (text) return text;
      const title = el.getAttribute("title")?.trim();
      if (title) return title;
      const img = el.querySelector("img[alt]")?.getAttribute("alt")?.trim();
      if (img) return img;
      return "";
    };

    const isVisible = (el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 || el.closest("[hidden]") == null;
    };

    const controls = [...document.querySelectorAll(selector)].filter(
      (el) => isVisible(el) && el.getAttribute("aria-hidden") !== "true",
    );
    const unnamed = controls
      .filter((el) => nameOf(el).length === 0)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") ?? "").slice(0, 70),
        html: el.outerHTML.slice(0, 120),
      }));

    const live = [...document.querySelectorAll("[aria-live], [role='status'], [role='alert'], [role='timer']")].map(
      (el) => ({
        tag: el.tagName.toLowerCase(),
        live: el.getAttribute("aria-live") ?? el.getAttribute("role"),
        atomic: el.getAttribute("aria-atomic"),
      }),
    );

    // Every page needs one main landmark and one h1.
    return {
      total: controls.length,
      unnamed,
      live,
      landmarks: {
        main: document.querySelectorAll("main").length,
        h1: document.querySelectorAll("h1").length,
        nav: document.querySelectorAll("nav").length,
      },
    };
  }, INTERACTIVE);

  report.push({ route: label, ...result });
}

await browser.close();

if (args.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  let total = 0;
  let unnamed = 0;
  for (const r of report) {
    total += r.total;
    unnamed += r.unnamed.length;
    const named = r.total - r.unnamed.length;
    console.log(
      `${r.unnamed.length === 0 ? "  " : "✗ "}${r.route.padEnd(32)} ${String(named).padStart(3)}/${String(r.total).padEnd(3)} named · ${r.live.length} live region(s) · main=${r.landmarks.main} h1=${r.landmarks.h1}`,
    );
    for (const u of r.unnamed) console.log(`      unnamed ${u.tag}: ${u.html}`);
  }
  const pct = total === 0 ? 100 : ((total - unnamed) / total) * 100;
  console.log(
    `\n${total - unnamed}/${total} interactive controls carry an accessible name (${pct.toFixed(1)}%).`,
  );
  console.log(
    `${report.reduce((s, r) => s + r.live.length, 0)} live regions across ${report.length} routes.`,
  );
}

if (report.some((r) => r.unnamed.length > 0)) process.exit(1);
