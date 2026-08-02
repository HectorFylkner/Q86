/**
 * DEVELOPMENT ONLY — WCAG contrast, computed rather than eyeballed.
 *
 * Reads every colour token straight out of app/globals.css (so it can
 * never drift from what ships), then measures every text and UI pair the
 * design actually uses, in BOTH themes, against the WCAG 2.1 thresholds:
 *
 *   4.5:1  body text
 *   3.0:1  large text (>= 18.66px bold or >= 24px) and non-text UI
 *
 * Usage:  node scripts/check-contrast.mjs [--json]
 * Exits 1 on any failure, so it can gate a commit.
 */
import fs from "node:fs";
import path from "node:path";

const CSS = fs.readFileSync(
  path.join(import.meta.dirname, "..", "app", "globals.css"),
  "utf8",
);

/** Pull the token block for a theme out of globals.css. */
function tokensFor(mode) {
  // Light lives in the first `:root {`; dark in `:root[data-theme="dark"]`.
  const marker =
    mode === "dark" ? ':root[data-theme="dark"] {' : ":root {";
  const start = CSS.indexOf(marker);
  if (start < 0) throw new Error(`no ${mode} token block in globals.css`);
  const block = CSS.slice(start, CSS.indexOf("\n}", start));
  const out = {};
  for (const [, name, value] of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8});/g)) {
    out[name] = value;
  }
  return out;
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * The pairs the design actually renders. `kind` picks the threshold:
 *   body  4.5   large 3.0   ui 3.0
 */
const PAIRS = [
  // --- body text --------------------------------------------------------
  ["ink", "paper", "body", "primary text on the app shell"],
  ["ink", "surface", "body", "primary text on a card"],
  ["ink", "highlight", "body", "primary text on a highlight chip"],
  ["graphite", "paper", "body", "secondary text on the app shell"],
  ["graphite", "surface", "body", "secondary text on a card"],
  ["ballpoint", "surface", "body", "link text on a card"],
  ["ballpoint", "paper", "body", "link text on the app shell"],
  ["redpen", "surface", "body", "error text on a card"],
  ["amber", "surface", "body", "warning text on a card"],
  ["good", "surface", "body", "positive delta text on a card"],
  ["bad", "surface", "body", "negative delta text on a card"],
  ["graphite", "highlight", "body", "caption text on a highlight chip"],

  // --- large text -------------------------------------------------------
  ["ink", "surface", "large", "figure and hero numbers on a card"],
  ["redpen", "surface", "large", "the pacing view's rushed-and-wrong figure"],
  ["amber", "surface", "large", "the pacing view's time-sink figure"],

  // --- non-text UI: marks, borders, fills --------------------------------
  ["series-1", "surface", "ui", "series 1 mark on a card"],
  ["series-2", "surface", "ui", "series 2 mark on a card"],
  ["series-3", "surface", "ui", "series 3 mark on a card"],
  ["series-4", "surface", "ui", "series 4 mark on a card"],
  ["good", "surface", "ui", "correct-outcome dot"],
  ["bad", "surface", "ui", "wrong-outcome ring"],
  ["ramp-1", "surface", "ui", "mastery grid, weakest step"],
  ["ramp-4", "surface", "ui", "mastery grid, strongest step"],
  ["ballpoint", "surface", "ui", "focus ring and active tab underline"],
  ["graphite", "surface", "ui", "axis ticks and budget line"],

  // --- ramp steps as fills, and the ring that marks a weak cell ----------
  // No text is set inside a ramp fill: a four-step single-hue ramp has a
  // middle band where neither ink nor paper clears 4.5:1 (this script is
  // what established that), so the mastery grid prints its figures in the
  // accessible name and the row summary instead of inside the cell.
  ["ramp-2", "surface", "ui", "mastery grid, second step"],
  ["ramp-3", "surface", "ui", "mastery grid, third step"],
  // The weak-cell ring is drawn outside the fill behind a surface gap, so
  // it is measured against the surface, not against the fill it marks.
  ["bad", "surface", "ui", "weak-cell ring, outside the fill"],

  // --- text set inside a coloured fill -----------------------------------
  ["paper", "ballpoint", "body", "label on a ballpoint-filled control"],
  ["paper", "redpen", "body", "label on a red-pen filled control"],
];

const THRESHOLD = { body: 4.5, large: 3, ui: 3 };

const results = [];
for (const mode of ["light", "dark"]) {
  const tokens = tokensFor(mode);
  for (const [fg, bg, kind, what] of PAIRS) {
    const a = tokens[fg];
    const b = tokens[bg];
    if (!a || !b) {
      results.push({ mode, fg, bg, kind, what, ratio: null, pass: false, note: "token missing" });
      continue;
    }
    const ratio = contrast(a, b);
    results.push({
      mode,
      fg,
      bg,
      kind,
      what,
      ratio: Math.round(ratio * 100) / 100,
      required: THRESHOLD[kind],
      pass: ratio >= THRESHOLD[kind],
    });
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const mode of ["light", "dark"]) {
    const rows = results.filter((r) => r.mode === mode);
    console.log(`\n=== ${mode} ===`);
    console.log(
      "  ratio   req  kind   pair                                what",
    );
    for (const r of rows) {
      console.log(
        `${r.pass ? "  " : "✗ "}${String(r.ratio ?? "—").padStart(6)}  ${String(r.required).padStart(3)}  ${r.kind.padEnd(5)}  ${`${r.fg} on ${r.bg}`.padEnd(34)}  ${r.what}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Token-discipline guard.
//
// The only colour literals outside globals.css are the SSR fallbacks in
// components/use-chart-tokens.ts, which exist because SVG presentation
// attributes cannot take CSS variables. Duplicated values drift, so assert
// they still match the stylesheet rather than trusting that they do.
// ---------------------------------------------------------------------------
const HOOK = fs.readFileSync(
  path.join(import.meta.dirname, "..", "components", "use-chart-tokens.ts"),
  "utf8",
);
const lightTokens = tokensFor("light");
const fallbackBlock = HOOK.slice(
  HOOK.indexOf("const FALLBACK"),
  HOOK.indexOf("function read()"),
);
const drift = [];
for (const [, name, value] of fallbackBlock.matchAll(
  /^\s*(?:"?([a-z]+)"?:\s*)?"(#[0-9a-fA-F]{6})"/gm,
)) {
  if (!name) continue;
  const expected = lightTokens[name];
  if (expected && expected.toLowerCase() !== value.toLowerCase()) {
    drift.push(`${name}: hook has ${value}, globals.css has ${expected}`);
  }
}
// Array-valued slots (series, ramp) are keyed positionally in the hook.
for (const [prefix, count] of [["series", 4], ["ramp", 4]]) {
  const arr = fallbackBlock.match(
    new RegExp(`${prefix}:\\s*\\[([^\\]]*)\\]`, "s"),
  );
  if (!arr) continue;
  const values = [...arr[1].matchAll(/"(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
  for (let i = 0; i < count; i++) {
    const expected = lightTokens[`${prefix}-${i + 1}`];
    if (expected && values[i] && expected.toLowerCase() !== values[i].toLowerCase()) {
      drift.push(
        `${prefix}-${i + 1}: hook has ${values[i]}, globals.css has ${expected}`,
      );
    }
  }
}
if (drift.length > 0) {
  console.error(
    `\n✗ ${drift.length} SSR fallback(s) in use-chart-tokens.ts have drifted from globals.css:`,
  );
  for (const d of drift) console.error(`  ${d}`);
} else {
  console.log(
    "SSR fallbacks in use-chart-tokens.ts match globals.css (no drift).",
  );
}

const failures = results.filter((r) => !r.pass);
if (drift.length > 0) process.exit(1);
console.log(
  `\n${results.length - failures.length}/${results.length} pairs meet WCAG AA (4.5:1 body, 3:1 large & non-text).`,
);
if (failures.length > 0) {
  console.error(`${failures.length} failing pair(s):`);
  for (const f of failures) {
    console.error(`  ${f.mode}: ${f.fg} on ${f.bg} — ${f.ratio} < ${f.required} (${f.what})`);
  }
  process.exit(1);
}
