# Q86 phase log

Durable state for the quality-standards workstream. Not a transcript —
goal, decisions with reasons, measurements, evidence paths, verification,
open risks, next action.

---

## Goal

Raise the platform across four dimensions — content substance, visual and
information design, daily ergonomics, and diagnostic power — to a standard
that is obvious on sight and provable on measurement.

Five workstreams, each ending with a passing acceptance check and its own
commit. A workstream whose check does not pass is reported **unverified**,
never *done*.

| WS | Scope | Acceptance |
| --- | --- | --- |
| W0 | Make improvement provable | Complete before-set of populated screenshots + baseline table |
| W1 | Content depth | `verify-bank.ts` passes whole bank; `pnpm seed` idempotent; distribution table; every new item's `check()` committed |
| W2 | Visual + information design | Before/after pairs at 3 widths × 2 themes; WCAG AA measured by computation; zero new color literals outside `globals.css` |
| W3 | Usability + access | Keyboard-only pass captured as evidence; accessible names on 100% of controls; before/after tap counts |
| W4 | Diagnostic power | `pnpm test` passes covering plan weighting, ELO, SRS, pacing; each new surface reachable and screenshotted |

---

## Constraints and decisions

### Load-bearing — do not change without stating why here first

Review & Edit mechanic · +2d/+7d/+21d schedule with the day-21 cold-solve
gate · casual-session tagging · offline operation without an API key ·
score-report-mirroring taxonomy · local-only storage.

*(No changes to any of these have been made. Any that follow are recorded
below with a reason.)*

### D1 — Playwright added as a dev dependency (W0)

`playwright` was not installed; Chromium is preinstalled at
`/opt/pw-browsers` but the driver was missing. Justification: the brief
requires a screenshot instrument, and no installed package can drive a
browser. It is a `devDependency`, never imported by app code, and is not
a UI kit. The preinstalled Chromium build (1194) does not match the build
this Playwright release would download, so `scripts/capture.mjs`
discovers the binary under `PLAYWRIGHT_BROWSERS_PATH` and passes
`executablePath` rather than downloading a second copy.

### D2 — Data Sufficiency is not Quant content (W1)

**Established from source before authoring.** The GMAT Focus Edition
Quantitative Reasoning section is 21 questions in 45 minutes and contains
**Problem Solving only**; Data Sufficiency was moved into the Data
Insights section. Sources:

- mba.com, *Exam Structure* / *Exam Content* — Quantitative Reasoning: 21
  questions, 45 minutes, Problem Solving; Data Insights lists Data
  Sufficiency among its five question types.
- gmac.com, *Details Of New GMAT Exam Revealed* — "the Quantitative
  Reasoning section … will contain none of the data sufficiency questions
  that appear in the current GMAT"; Data Insights "has pulled in
  Integrated Reasoning and data sufficiency from Quantitative Reasoning".

The codebase already half-knew this: `lib/engine.ts:117-119` excludes DS
from every timed section sim. The bank did not — 62 of 360 items carried
`format: "data_sufficiency"`.

**Resolution: relabel, do not retire.** The 62 items train real Quant
reasoning (sufficiency thinking is what makes a Problem Solving question
tractable in 2 minutes), and they remain valid Data Insights practice for
a user sitting the whole exam. Retiring them would destroy 17% of a
verified bank to fix a labelling error. They are kept, marked as what
they genuinely train, and excluded from Quant-fidelity statistics. See
the W1 section for the mechanism.

---

## Baseline measurements — W0

Measured on the checked-out build at commit `5004caf`, database populated
by `scripts/dev-seed-history.ts` (seed 8686, 42 days).

### Question bank — `scripts/seed-bank.json`

| Metric | Baseline |
| --- | --- |
| Total questions | 360 |
| Difficulty | D2 36 · D3 108 · D4 144 · **D5 72 (20.0%)** |
| Format | problem_solving 298 · data_sufficiency 62 (17.2%) |
| Content domain | arithmetic 190 · algebra 170 |
| Context | pure 218 · real 142 |
| Fundamental skill | VOF 152 · Algebra 98 · Counting/Stats 62 · Rates/Percent 48 |
| Subtopic spread | **min 8** (`interest_profit_discount`) → **max 28** (`algebraic_translation`), 3.5× |
| Subtopics below 15 items | **15 of 24** |

Full per-subtopic baseline:

```
interest_profit_discount  8   min_max_optimization     14   remainders_units_digits   18
mixtures_weighted_avg    10   overlapping_sets         14   consecutive_evenly_spaced 18
rates_speed_work         10   quadratics_factoring     14   prime_factorization       18
percent_change_chains    10   inequalities             14   exponents_roots_props     18
ratios_proportions       10   linear_systems           14   divisibility_gcf_lcm      20
combinatorics            12   functions_sequences      14   parity_signs              20
probability              12   abs_value_number_line    16   must_be_true_testing      24
series_patterns          12                                 algebraic_translation     28
statistics_mean_median   12
```

### Accessibility

| Metric | Baseline | How measured |
| --- | --- | --- |
| `aria-*` attributes, whole app | **31** | `grep -roh 'aria-' app components lib \| wc -l` |
| `role=` attributes | 7 | `grep -roh 'role=' app components \| wc -l` |
| Components with keyboard handlers | **5** | `patterns-client`, `decide-client`, `timed-client`, `question-runner`, `deck-client` |
| Live regions (`aria-live`) | 1 | see W3 |

### Visual system

| Metric | Baseline |
| --- | --- |
| Files importing Recharts | **1** (`components/analytics/analytics-client.tsx`) |
| Distinct chart types in the app | 3 (bar, line, scatter) |
| `text-xs` occurrences | 136 |
| `text-sm` occurrences | 214 |
| `text-base` and larger | 39 |
| Ratio small : large type | **8.97 : 1** |
| Color tokens in `globals.css` | 9 |

### Route payloads (`pnpm build`, First Load JS)

| Route | Size | First Load JS |
| --- | --- | --- |
| `/postmortem/[attemptId]` | 25.4 kB | **251 kB** |
| `/drill` | 3.29 kB | 238 kB |
| `/queue` | 3.72 kB | 238 kB |
| `/timed` | 8.86 kB | 235 kB |
| `/patterns` | 8.76 kB | 231 kB |
| `/analytics` | **112 kB** | 221 kB |
| `/deck` | 3.48 kB | 189 kB |
| `/decide` | 5.21 kB | 188 kB |
| `/learn` | 3.11 kB | 186 kB |
| `/` (Today) | 1.5 kB | 147 kB |
| `/mastery` | 900 B | 107 kB |
| shared by all | — | 103 kB |

### Verification tooling

| Metric | Baseline |
| --- | --- |
| Test script in `package.json` | **none** |
| Automated tests | **0** |
| Checks that run | `tsc` (via `next build`) and `eslint` only |

---

## Work completed

### W0 — Make improvement provable ✅

**Shipped**

- `scripts/dev-seed-history.ts` — development-only, idempotent synthetic
  training history. 42 days of sessions with per-skill learning curves
  (Rates/Percent the persistent weakness, VOF the strength), difficulty-
  tilted accuracy, realistic time distributions (near-benchmark when
  correct, splitting into rushed guesses and time sinks when wrong),
  confidence correlated with outcome, error-type mix, Review & Edit
  ledger entries, pattern rounds with ELO replayed through
  `lib/elo.ts`, deck scheduling replayed through `lib/srs.ts`, one
  imported score report, and open content flags.

  The **redo ladder is replayed inline as the days pass** — redo sessions
  are scheduled from what the ladder says is due each morning, and stage
  transitions run the exact rules in `lib/redo.ts` including the day-21
  cold-solve gate. The miss → +2d → +7d → +21d chain is therefore real
  data, not a shape drawn over it.

  Guard: refuses to run when the database holds attempts it did not
  create, unless `--force`. Refuses under `NODE_ENV=production`.

- `scripts/capture.mjs` — the before/after instrument. 12 routes × 3
  widths (390/768/1280) × 2 themes = 72 screenshots at 2× into a
  gitignored directory. Forces the theme via `localStorage` + the
  `data-theme` attribute rather than depending on leftover state; runs
  with `reducedMotion: "reduce"`; caps pages taller than 5200 CSS px
  (the redo queue reaches 35,982 px at 390) so the instrument never
  silently times out on the page most worth seeing.

**Verification**

```
$ node --experimental-strip-types scripts/dev-seed-history.ts --force
✓ synthetic history seeded (seed 8686, 42 days)
  sessions      77 study + pattern rounds
  attempts      1013 (348 misses)
  edits         20
  redo queue    169 rows (40 due now)
  deck reviews  92
  pattern       660 items across 9 categories
  test date     2026-09-08
```

Idempotency proven by fingerprint, not assertion — attempt count, summed
time, summed correct, redo stage sum, cleared count, and all nine ELO
ratings to 4 decimals were identical across two consecutive runs.

```
$ node scripts/capture.mjs --out=screenshots/w0-baseline
✓ 72 screenshots → screenshots/w0-baseline (12 routes × 3 widths × 2 themes)
  14 page(s) taller than 5200px captured top-down
```

**Evidence**

- Before-set: `screenshots/w0-baseline/` (72 PNGs, gitignored)
- Seeder: `scripts/dev-seed-history.ts`
- Capture: `scripts/capture.mjs`

**Acceptance: PASSED** — complete before-set of populated screenshots
exists, and the baseline table is above.

---

### W1 — Content depth ✅

**Shipped**

**1. The authoring gate got a second gate: computed distractor reachability.**

`scripts/author/harness.mjs` now accepts `requireTrapValues: true`. Items
authored under it must carry `trap_values(q)`, which *computes* each wrong
choice by committing the specific named error from `trap_map` — a sign
flip, a part/whole inversion, an off-by-one, answering one step early —
and the harness asserts the computed result equals that choice. A
distractor that cannot be produced by a stated mistake fails the batch.

This is the difference between asserting a distractor is tempting and
proving it is reachable. It caught real defects on first run: a trap
described as "halves the squared rate" that actually needed doubling; a
`trap_map` keyed off the wrong index after a key moved; a committee trap
whose stated error produced the correct answer, not the distractor.

**2. Format fidelity resolved (decision D2 above): relabelled, not retired.**

- `lib/taxonomy.ts`: `EXAM_SECTIONS`, `SECTION_BY_FORMAT`,
  `QUANT_FORMATS`, `FORMAT_SECTION_LABELS`, `FORMAT_NOTES`, each carrying
  the primary-source citation in a comment.
- `lib/engine.ts` timed sims now filter on `QUANT_FORMATS` rather than a
  hard-coded literal.
- The runner and drill setup label DS items "DS · Data Insights" so the
  distinction is visible where the questions are actually served.

**3. Bank rebalanced — both stated targets met.**

| Metric | Before | After | Target |
| --- | --- | --- | --- |
| Total questions | 360 | **438** | — |
| D5 count | 72 | **150** | — |
| **D5 share** | **20.0%** | **34.2%** | ≥ 33.3% ✅ |
| **Smallest subtopic** | **8** (`interest_profit_discount`) | **16** (`combinatorics`) | ≥ 15 ✅ |
| Subtopics below 15 | 15 of 24 | **0 of 24** | 0 ✅ |
| Subtopic spread | 3.5× (8 → 28) | **1.9× (16 → 30)** | — |
| Items with computed distractor reachability | 0 | **78** | — |

Full after-distribution by difficulty: D2 36 · D3 108 · D4 144 · D5 150.
By skill: VOF 168 · Algebra 110 · Counting/Stats 80 · Rates/Percent 80.

All 78 new items are difficulty 5, allocated first to close every
subtopic deficit and then to deepen the top band everywhere. Six batch
files, all committed:

- `scripts/author/batch-q5-interest_profit_discount.mjs` (8)
- `scripts/author/batch-q5-mixtures-rates.mjs` (12)
- `scripts/author/batch-q5-percent-ratios.mjs` (12)
- `scripts/author/batch-q5-counting-stats.mjs` (18)
- `scripts/author/batch-q5-algebra.mjs` (12)
- `scripts/author/batch-q5-vof.mjs` (16)

Every `check()` derives the answer independently of the written solution:
brute-force scans over cents/liters/marbles, grid dynamic programming,
exhaustive permutation and subset enumeration, BigInt factorials, marching
integration of fill rates, bisection on sign changes. No item's key rests
on its own prose.

**4. Chapters got the transfer layer they lacked** —
`lib/chapter-transfer.ts` + `components/lesson/transfer.tsx`, rendered as
three new sections in every chapter:

- **At the top band** — the hardest bank item for that subtopic, shown
  whole with stem, choices, formal path, fastest path and takeaway, and a
  one-click "drill this one cold" link. Chapters previously taught at the
  middle of the curve; the exam does not.
- **Recognition table** — up to 12 stem cues drawn from that chapter's
  bank items, each mapped to the method it selects and tagged with its
  difficulty band, hardest first.
- **Named traps** — the exact `trap_map` sentences a post-mortem will
  quote, classified into the platform's six-error vocabulary and spread
  across error types so the section reads as a vocabulary rather than one
  bucket.

**Design decision: derive the transfer layer from the bank, don't
hand-write it beside the bank.** The brief's requirement is that "reading
a chapter and reviewing a miss speak one language". Hand-authored tables
satisfy that on the day they are written and drift afterwards. Sourcing
them from the installed questions makes divergence structurally
impossible: the recognition rows, the worked example and the trap
vocabulary *are* the strings the runner and the post-mortem show. The
cost is that a chapter's transfer quality is capped by its bank items'
quality — which is precisely what the authoring gate now enforces.

The trap classifier is deliberately conservative: a trap that does not
clearly match one error type is labelled "Unclassified" rather than
guessed at, because a wrong label teaches the wrong repair.

**Verification**

```
$ node --experimental-strip-types scripts/verify-bank.ts
Bank: 438 questions — value_order_factors: 168,
counting_sets_series_prob_stats: 80, equal_unequal_alg: 110,
rates_ratio_percent: 80
All bank questions pass mechanical verification.

$ pnpm seed
Seed bank loaded: 0 inserted, 438 refreshed, 0 retired, 438 verified …
$ pnpm seed          # idempotent: second run inserts and retires nothing
Seed bank loaded: 0 inserted, 438 refreshed, 0 retired, 438 verified …

$ pnpm lint
✖ 26 problems (0 errors, 26 warnings)   # all pre-existing unused-arg warnings
```

**Acceptance: PASSED** — `verify-bank.ts` passes over the whole bank,
`pnpm seed` is idempotent, the before/after distribution table is above,
and every new item's `check()` (and `trap_values()`) is in a committed
batch file under `scripts/author/`.

**Scope not taken in W1:** no new chapter markdown files were authored.
The taxonomy's 24 subtopics already have 24 chapters — the uncovered
pedagogy is the six-error vocabulary and the exam mechanics (Review &
Edit, pacing), which are not subtopic chapters and belong behind Progress
and Timed rather than Learn. Recorded as a deliberate omission, not an
oversight; see the deliverable's "left undone" list.

---

### W2 — Visual and information design ✅

**Shipped**

**1. A measured chart palette, added to `globals.css` as tokens.** The
`dataviz` skill was loaded before any chart code was written, and every
value below was produced by its validator, not chosen by eye:

| Slot | Light | Dark | Validator result |
| --- | --- | --- | --- |
| Categorical (4 skills) | `#2f4fd8 #cf3b2c #0f8f7a #8a4bc9` | `#7189ea #dc6752 #18ac91 #ad74e4` | ALL CHECKS PASS both modes; worst adjacent CVD ΔE 10.9 light / 9.0 dark |
| Status good/bad | `#1d8659 #cf3b2c` | `#2aa273 #dc6752` | ALL PASS, all-pairs; ΔE 8.1 light |
| Sequential ramp | `#8293c3 #6076cf #3f56bd #233690` | `#5265ae #6b80cc #8598e2 #a9baf7` | ordinal checks PASS both modes |

The existing three-accent set was measured first and **failed**: amber
and red pen sat at ΔE 13.7 under normal vision, below the 15 floor. That
is why the chart palette is a separate, wider set rather than a reuse of
the UI accents.

**2. A shared chart layer** — `components/charts/chart-kit.tsx`. Figure
frame, axis and grid defaults, tooltip card, legend (with line/dot/ring
keys), empty state, fixed mark specs (2px lines, 22px bar cap, 4px data
ends, 4px markers, 2px surface rings, 10% area washes, hairline solid
grid), and a mount-gated `ResponsiveContainer`. Recharts mints
clip-path ids per render, so every chart in the app — including the ones
written before this layer — was emitting a hydration mismatch; routing
them all through `SafeResponsiveContainer` removed it.

**3. Live theme tracking.** `useChartTokens` now also watches a
`MutationObserver` on `data-theme`, so the app's own toggle repaints SVG
marks immediately rather than on reload. HTML surfaces (the mastery grid,
the mirror meters) were converted to CSS variables in inline styles and
need no JS at all.

**4. The four views the data had earned:**

- **Mastery grid** (`components/charts/mastery-grid.tsx`) — all 24
  subtopics × 4 difficulty bands, one screen. Fill = accuracy on the
  sequential ramp; a red-pen ring marks cells with ≥ 6 attempts below the
  85% bar. Filterable by skill; every cell is a deep link into that exact
  drill; each cell's exact record is its accessible name.
- **Pacing** (`components/charts/pacing-view.tsx`) — every attempt as
  time × difficulty × outcome, with the rush and sink bands shaded and
  the 129s section budget drawn, plus an accuracy-by-time-bucket bar
  whose *shape* is the diagnosis. Outcome is double-encoded (filled dot
  vs hollow ring) because the good/bad pair sits near the CVD floor.
- **ELO trajectory** (`components/charts/elo-trajectory.tsx`) — nine
  categories as small multiples on one shared scale, one hue. Nine hues
  would require cycling the palette, which is never allowed; faceting is
  also the better answer to the actual question ("which one is not
  moving").
- **Score-report mirror** (`components/charts/score-report-mirror.tsx`) —
  total, three section scores, then skills / domains / contexts in the
  official order, with the imported percentile and the platform accuracy
  side by side. Deliberately **not** on a shared axis: a percentile and
  an accuracy are different quantities, and one scale would invite an
  invalid comparison. Platform accuracy counts Quant formats only, per
  decision D2.

**5. A real typographic scale** in `@theme`: micro / caption / body /
lede / title / section / figure / hero, each with a stated job, replacing
the `text-xs` + `text-sm` monoculture. Hero and figure sizes switch to
proportional figures (`tabular-nums` makes a display number read loose).

**Two design decisions worth recording**

- **The mastery grid prints no number inside a cell.** A four-step
  single-hue ramp has a middle band where *neither* ink nor paper clears
  4.5:1 against the fill — established by measurement, not assumed. Ninety-six
  numbers is also a number on every point, the density at which labels
  stop working. The fill carries magnitude, the ring carries "below the
  bar", and the exact figures live in each cell's accessible name, its
  tooltip, and the row summary.
- **The weak-cell ring is drawn outside the fill**, behind a 2px surface
  gap, so it is measured against the card surface (4.84:1) instead of
  against a blue fill (1.6:1).

**Verification**

```
$ node scripts/check-contrast.mjs
… 60 pairs measured across both themes …
SSR fallbacks in use-chart-tokens.ts match globals.css (no drift).
60/60 pairs meet WCAG AA (4.5:1 body, 3:1 large & non-text).
```

The check is computed from `app/globals.css` itself, so it cannot drift
from what ships, and it exits non-zero on failure. It found and forced
five real fixes: `amber` at 3.64:1 as body text, `good` at 4.08:1, and
the ramp's weakest step at 2.07:1 / 2.28:1 — all of which had been in the
build before this workstream and none of which were visible by eye.

Colour-literal audit — the invariant is "no colour literal outside
`app/globals.css`":

```
$ grep -rnoE '#[0-9a-fA-F]{3,6}' app components lib --include='*.tsx' --include='*.ts'
app/manifest.ts:11:#FAFAF7     ← PWA manifest; cannot take a CSS variable
app/manifest.ts:12:#FAFAF7     ← pre-existing, unchanged
```

Zero new literals. The SSR fallbacks in `components/use-chart-tokens.ts`
(needed because SVG presentation attributes cannot take CSS variables)
are now **asserted against `globals.css`** by the same script — it caught
six that had drifted during this workstream.

**Evidence**

- Before: `screenshots/w0-baseline/` · After: `screenshots/w2-after/`
  (72 PNGs each: 12 routes × 390/768/1280 × light/dark)
- Contrast table: `node scripts/check-contrast.mjs` (or `--json`)

**Acceptance: PASSED** — before/after pairs exist at all three widths in
both themes; all 60 measured pairs meet WCAG AA by computation with the
numbers recorded; zero new colour literals outside `globals.css`.

---

### W3 — Usability and access ✅

**Shipped**

- **`components/shortcuts.tsx`** — the keyboard map, written down once and
  opened from anywhere with `?`, plus a persistent affordance so the
  binding is discoverable without already knowing it. Focus moves into
  the dialog, is trapped there, Escape closes it, and focus returns to
  whatever opened it. Bindings that exist but are undiscoverable are
  bindings nobody uses; this is why the documentation is *in the app*
  rather than in a README nobody opens mid-session.
- **`components/live-region.tsx`** — `Announce`, `ClockAnnouncer`,
  `TimerReadout`. The clock announces at milestones (30/20/15/10/5/2/1
  minutes, 30s, 10s) rather than every tick, because a per-second live
  region talks over everything else and is worse than silence; it also
  carries `role="timer"` with an accessible name so it can be read on
  demand.
- **Live regions wired into the three places the brief names**: the timed
  clock, the answer feedback (result + your choice + the key + position
  in the set — a drawn stroke and a colour are nothing a screen reader
  can see), and the redo queue's state changes.
- **`components/focus-manager.tsx`** — a skip link as the first tab stop,
  and focus moved to the new page's `h1` on client-side route change,
  then the tabindex removed on blur so the heading never becomes a
  permanent tab stop.
- **`F` flags the current question** from the keyboard and moves focus
  into the flag panel.
- **Friction:** a "Start today" action that runs the due redos and the
  weighted drill as one list, and a "Pick up where you stopped" card
  driven by `lib/resume.ts` — which finds the most recent unfinished
  drill/redo session, works out which questions were never answered, and
  resumes rather than restarts. Timed sections are deliberately excluded:
  a wall-clock section cannot be paused and resumed without destroying
  what it simulates, and offering to would be a lie about what the
  platform can give back.
- **Touch targets:** a coarse-pointer rule gives every control-shaped
  element a 44px minimum, and the Today CTAs, section tabs and form
  controls were raised explicitly.

**Measurements**

| Metric | Before | After |
| --- | --- | --- |
| Interactive controls with an accessible name | 508/508 at rest, **runner states unaudited** | **676/676 (100%)** across 16 states incl. mid-drill, mid-timed and dialog-open |
| Live regions | **0** | **5** (drill answering, drill revealed, timed clock ×2, redo queue) |
| Keyboard-only steps through the full loop | not measurable | **13/13 with pointer events disabled** |
| Taps: open app → answering the day's first question | 2 taps **+ a return trip to Today** | **1 tap** (redos first, then the drill, one run) |
| Taps: return to an interrupted run | **no affordance existed** | **1 tap**, resuming at the unanswered remainder |
| Horizontal page overflow at 390px on `/analytics` | **138px** | **0px** (scroll contained inside the card) |
| Sub-44px tap targets on Today at 390px | 21 | **7** (top nav only — see below) |

**Verification**

```
$ node scripts/keyboard-pass.mjs --out=screenshots/keyboard
Keyboard-only pass (pointer events disabled):
  ✓ Open Today · ✓ Open the keyboard map with ? · ✓ Close it with Escape
  ✓ Tab to Start today and press Enter · ✓ Answer with a letter key
  ✓ Set confidence with L · ✓ Submit with Enter
  ✓ Answer feedback reaches a live region
      → "Incorrect. You chose C. The answer is D. Question 1 of 58."
  ✓ Open the flag panel with F · ✓ Advance with N
  ✓ Reach the Review deck · ✓ Redo queue live region
  ✓ Timed section start control reachable
13/13 steps completed with the pointer disabled.

$ node scripts/a11y-audit.mjs
676/676 interactive controls carry an accessible name (100.0%).
5 live regions across 16 routes.
```

The keyboard pass disables pointer events for the whole run, so a step
that secretly needed a click fails rather than quietly passing.

**Acceptance: PASSED** — keyboard-only pass captured as 13 screenshots in
`screenshots/keyboard/`; accessible names on 100% of interactive controls
including the in-session states; before/after tap counts for both paths.

**Known remaining, stated rather than hidden:** 7 top-nav links sit at
40px on a coarse pointer, and the mastery grid's 120 cells are 44×36. The
nav is horizontally scrollable and secondary on phones (the 52px bottom
tab bar is the primary), and a 24×4 grid at 44px per cell cannot fit a
390px screen — the same drill is reachable from the row's chapter link
and from Mastery. Both are trade-offs, not oversights.

---

## Open risks

- **R1 — Bank rebalancing is large.** Reaching D5 ≥ ⅓ and no subtopic
  below 15 from the baseline requires roughly 120+ new verified items,
  every one carrying an independent `check()`. Volume is the risk, not
  method.
- **R2 — Screenshot capture depends on a populated database.** After/before
  comparisons are only fair if both sides run the same seed. All captures
  use `--seed=8686`, 42 days.
- **R3 — `/analytics` first-load JS is 221 kB, 112 kB of it route code.**
  W2 adds chart surfaces; without a shared layer this grows further.

## Next action

W1 — content depth. Format-fidelity resolution (D2) lands first as a
schema-free relabelling, then bank authoring by subtopic deficit.
