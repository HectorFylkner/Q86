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

### W4 — Diagnostic power ✅

**Shipped**

**1. `pnpm test` — 73 tests, 9 suites, `node --test` with no new runner
dependency.**

| Suite | What it pins |
| --- | --- |
| `tests/elo.test.ts` | Symmetry, the 400-point 10:1 expectation, K bounds, that a win-loss pair drifts *toward* the item rather than back to the start, and that a 500-win streak has strictly shrinking steps and stays bounded |
| `tests/srs.test.ts` | The 1d → 3d → ×ease ladder, the 1.3 ease floor, that a floored card can still grow (never daily-forever), that no grade ever produces a sub-1-day interval, and that the preview on the buttons is what the grade actually does |
| `tests/plan.test.ts` | Weights always sum to 1, the weaker skill always outweighs, the 5% maintenance floor holds in every corner (including all-perfect and all-zero), the 50/50 baseline blend, manual override precedence, largest-remainder counts summing to the stated total, the phase arc boundaries, the Speed-phase override and the Peak-week backoff, and that the plan is a pure function of its inputs |
| `tests/pacing.test.ts` | Monotone benchmarks straddling 128s, the sink boundary being strict, that "rushed" counts only wrong answers, that sinks rank by *ratio* not absolute time, and that no item is ever both rushed and a sink |
| `tests/redo.test.ts` | The exact +2d/+7d/+21d shape, reset-to-stage-0 on any miss, that stage 2 clears only when correct **and** inside the 150s cold-solve limit, that right-but-slow falls back to +7d, and that the fastest possible clearance is 30 days |
| `tests/analytics-math.test.ts` | Half-open time buckets (no attempt counted twice, none lost), empty accuracy being null and never zero, even-length medians, mastery bands, the min-attempts gate, trailing-window boundaries, calibration gap signs, and attempt-weighted calibration error |
| `tests/error-inference.test.ts` | That a time *sink* is never attributed to time pressure (the repairs are opposite), that thin history is ignored, that an evidence-free miss reports uncertainty instead of a label, and that every candidate carries its evidence |

Two of my own assertions failed first and were wrong, not the code: ELO
win-then-loss drifts toward the item rating, and a long streak's steps
shrink without reaching zero. Both are now stated as the properties that
actually hold.

**2. Error attribution that is better than a guess, and correctable.**
`lib/error-inference.ts` ranks candidates from five independent signals
and returns each with its evidence:

- **the distractor chosen** — the strongest signal, and new: since W1
  every wrong choice is *proved* to be what a specific named mistake
  produces, so which wrong answer was picked is a direct observation
  about which mistake was made
- declared confidence (a locked-in miss is a wrong belief, not a slip)
- time against benchmark — with the explicit rule that a **time sink is
  never time pressure**, because those two repairs are opposites
- the subtopic's recent record (weak → content gap; strong → execution)
- how near the chosen answer sits to the key

It never auto-tags silently: `components/drill/error-attribution.tsx`
shows the suggestion, its percentage of the signal, an expandable list of
every candidate's evidence, and six one-key overrides. Below 40% of the
signal it says so — "the evidence leans toward X, but only just. Your
call." A misdiagnosis the user can see is one they can fix.

**3. A defensible plan.** `components/dashboard/plan-evidence.tsx`
replaces the weights bar chart. Each skill's share expands to the
observations that produced it: the rolling record with its actual counts,
the imported percentile and the fact that the two are blended half and
half, the manual override when one is set, and an explicit note when a
skill is pinned at the 5% floor. Disagreement can now be on grounds.

**4. The miss→mastery chain, shown rather than asserted.**
`lib/miss-chain.ts` queries five links independently per miss —
classified, chapter, deck card, redo ladder, revisited — and reports each
as done or broken. On the current fixture it immediately surfaced real
breaks: **Classified 6/8, Deck card 4/8, Revisited 0/8**. An untagged
miss looks like nothing is wrong anywhere else in the app; here it is a
visible gap.

**5. Calibration as a diagnosis, not a table.**
`components/charts/calibration.tsx` draws each bar *from* the claimed
accuracy *to* the actual one, so the direction of the error is the shape
of the mark and not only its colour, and names the repair each direction
implies: overconfidence means abandon sooner, underconfidence means you
are rushing away from questions you can do. The headline is an
attempt-weighted mean gap, so a 40-point miss on two attempts cannot
outshout a 10-point miss on two hundred.

**6. The tested math is the shipped math.** `lib/analytics-math.ts` is
used by `lib/analytics.ts` and the mastery grid rather than existing
only for the tests, and `lib/trap-classify.ts` is shared by the chapter
transfer layer and the error inference, so the chapter and the
post-mortem cannot drift apart in vocabulary.

**Verification**

```
$ pnpm test
# tests 73
# suites 9
# pass 73
# fail 0
```

**Acceptance: PASSED** — `pnpm test` passes and covers plan weighting,
ELO, SRS intervals and pacing (plus the redo ladder, analytics
aggregation and error inference). Each new diagnostic surface is
reachable in the running app and captured in `screenshots/w4-after/`.

---

## Deliverable — before/after across every baseline metric

| Metric | Before (`5004caf`) | After (`03318d2`) |
| --- | --- | --- |
| **Bank size** | 360 | **438** |
| **D5 share** | 20.0% (72) | **34.2% (150)** |
| Difficulty spread | D2 36 · D3 108 · D4 144 · D5 72 | D2 36 · D3 108 · D4 144 · **D5 150** |
| **Smallest subtopic** | **8** (`interest_profit_discount`) | **16** (`combinatorics`) |
| Subtopics below 15 items | 15 of 24 | **0 of 24** |
| Subtopic spread | 3.5× | **1.9×** |
| Items with computed distractor reachability | 0 | **78** |
| Format fidelity | 62 DS items, unresolved | **Resolved from primary sources**; DS labelled Data Insights, excluded from Quant-fidelity stats |
| **`aria-*` attributes** | 31 | **90** |
| **Accessible names on controls** | unmeasured (508/508 at rest; runner states never audited) | **721/721 (100%)** across 16 states incl. mid-drill and mid-timed |
| **Live regions** | 0 | **5** |
| Components with keyboard handlers | 5 | 7, plus a global map on `?` |
| **Keyboard-only loop** | not measurable | **13/13 steps, pointer disabled** |
| **Files using Recharts** | 1 | **6** (behind one shared chart layer) |
| **Distinct chart/data views** | 3 (bar, line, scatter) | **9** (+ mastery grid, pacing scatter + buckets, ELO small multiples, score-report mirror, calibration, miss-chain) |
| Colour tokens in `globals.css` | 9 | **19** (10 added, every one validator-measured) |
| **WCAG AA pairs measured** | 0 | **60/60 pass, both themes** |
| `text-xs` + `text-sm` vs larger | 350 : 39 (9.0 : 1) | a named 8-step scale with a stated job per size |
| **Test script** | none | **`pnpm test`** |
| **Automated tests** | 0 | **73, in 9 suites** |
| Checks that run | `tsc`, `eslint` | + `pnpm test`, `verify:bank`, `check:contrast`, `check:a11y`, `check:keyboard` |
| Taps: open app → answering | 2 + a return trip | **1** |
| Taps: resume an interrupted run | no affordance | **1** |
| 390px horizontal overflow (`/analytics`) | 138px | **0px** |
| `/analytics` First Load JS | 221 kB | 232 kB (+11 kB for five new views) |
| `/` First Load JS | 147 kB | 151 kB |
| `/postmortem` First Load JS | 251 kB | 251 kB |

### Evidence paths

| What | Where |
| --- | --- |
| Before screenshots | `screenshots/w0-baseline/` (72 PNGs) |
| After screenshots | `screenshots/w4-after/` (72 PNGs); `screenshots/w2-after/` is the W2 checkpoint |
| Keyboard-only pass | `screenshots/keyboard/` (13 PNGs, pointer disabled) |
| Contrast measurements | `pnpm check:contrast` (add `--json` for the raw table) |
| Accessible-name audit | `pnpm check:a11y` |
| Bank verification | `pnpm verify:bank` |
| Loop arithmetic | `pnpm test` |

All screenshot directories are gitignored — they are instruments, not
artifacts, and both sides are reproducible from the same fixture
(`scripts/dev-seed-history.ts --seed=8686`, 42 days).

---

## Open risks

- **R1 — RESOLVED.** Bank rebalancing landed: 78 new D5 items, both
  targets met, whole bank re-verified.
- **R2 — Screenshot comparisons depend on a matching fixture.** Both
  sides use `scripts/dev-seed-history.ts --seed=8686`, 42 days. Running
  `scripts/a11y-audit.mjs` or `scripts/keyboard-pass.mjs` writes real
  attempts, so re-run the seeder before a comparison capture.
- **R3 — `/analytics` first-load JS is 232 kB**, up 11 kB from baseline
  for five new views. Acceptable for a local-first single-user app, but
  it is the one number that moved the wrong way; splitting the route by
  view is the obvious next step if it grows again.
- **R4 — The trap classifier is keyword-driven.** It is deliberately
  conservative (returns null rather than guessing), so its failure mode
  is an unlabelled trap, not a wrong one. But new authoring vocabulary
  will need new signatures, and nothing currently warns when the
  "Unclassified" share rises.
- **R5 — The error-inference weights are hand-set, not fitted.** They
  encode defensible reasoning and are tested for the properties that
  matter (a time sink is never time pressure; thin evidence reports
  uncertainty), but the specific numbers have never been checked against
  the user's own corrections. Once enough overrides accumulate, they are
  the data that should set them.

## Highest-value work left undone, ranked

1. **Fit the error-inference weights to the user's own corrections.**
   Every override is a labelled training example, and the panel already
   records them. The inference would go from defensible to measured, and
   it is the one place in the platform where a wrong number silently
   trains the wrong repair. Left because it needs override data that
   does not exist yet — this session created the mechanism, not the
   history.

   > **Correction, session 3 (2026-08).** "The panel already records
   > them" is **false**, and two sessions have now deferred this item on
   > the wrong blocker. `suggestErrorType()` computes the ranked
   > suggestion on demand and returns it to the runner;
   > `tagAttempt()` (`lib/actions.ts`) persists only the final
   > `errorType`/`errorSubtag`. Nothing stores *what was suggested*, so
   > an override is indistinguishable from a first-time tag and the
   > labelled examples cannot be reconstructed after the fact — not even
   > from history already collected. The blocker is not "wait for
   > overrides to accumulate"; it is that the suggestion is not written
   > down, and every day it stays that way is training data lost.
   > Verified by reading both functions, 2026-08-02.
2. **New chapters for the pedagogy the taxonomy has and Learn does not:**
   the six-error vocabulary as a chapter in its own right, and the exam
   mechanics (Review & Edit, pacing triage, abandon rules). All 24
   subtopics have chapters; these are the cross-cutting skills that
   decide points at the margin and currently live only in tooltips.
   Left because it is prose authoring at chapter length, and the bank
   and the instruments were the higher-leverage spend.
3. **Split `/analytics` by view.** It is now nine surfaces on one route
   at 232 kB and 9,300 px tall at 1280. The Progress group already has
   tabs; moving the mirror, the grid, pacing, and the diagnostics into
   their own views would cut the payload and make each one findable.
   Left because it is a navigation change, and the brief is explicit
   that seven top-level sections is the settled number — this needs a
   decision about the group's internal tabs rather than a refactor.

## W5 — Technique, not just content (second brief)

**Brief:** "Continue improving the content of the platform. I think you
have to dig quite thoroughly into GMAT Ninja, TTP, etc, and to make sure
that you are closely resembling their learning techniques, segmentation,
etc."

### Research

`WebFetch` returns 403 from both `blog.targettestprep.com` and
`gmatninja.com`, so the research went through `WebSearch` against
published descriptions of both curricula and against the official Focus
Edition section format. What the two share, and Q86 did not have:

- **Technique is taught as its own subject, not as a footnote.** Both
  curricula spend a large share of their material on *how to attack a
  question* — backsolving, picking numbers, estimating, when to abandon —
  independently of what the question is about. Q86's entire taxonomy is
  content (domains → contexts → skills → subtopics → error types),
  mirroring the score report. That is the right spine for analytics and
  an incomplete one for teaching.
- **Segmentation is by approach as well as by topic.** TTP drills a
  concept in isolation and then drills the approach; Ninja's central
  claim is that reaching for algebra by reflex is what ruins timing.
- **Pacing is taught as a rehearsed system**, with checkpoints, not as
  "watch the clock".

### The measured deficit

`lib/solution-strategy.ts` classifies every bank item's
`fastest_path_md` into six named strategies. Against the shipped bank of
438 verified items:

| Strategy | Items | Share |
| --- | ---: | ---: |
| Set up and solve (structural) | 361 | 82.4% |
| Eliminate | 24 | 5.5% |
| Pattern | 20 | 4.6% |
| Backsolve | 18 | 4.1% |
| Pick numbers | 13 | 3.0% |
| Estimate | 2 | 0.5% |

Only **17.6%** of the bank teaches a non-algebraic technique, and
estimation — the technique with the best return per minute on a
no-calculator section — is present in two items out of 438.

Two things were checked before treating that as a content finding rather
than a classifier artefact:

1. The first run reported 87.7% structural. That was the classifier
   measuring LaTeX delimiters, not prose: the bank writes maths inline,
   so `Test $(x, y) = (-1, 2)$` reached the matcher as `Test $(`. Adding
   `normalize()` (strip macros and `${}\`) moved it to 82.4%.
2. Sixteen structural-classified paths were then read by hand. Two were
   genuine misses, which widened three signatures (`test the standard
   set`, `test x =`; `each pair`, `pairing the terms`; `kills`,
   `survives`). The remaining fourteen were correctly structural.

So the fix is authoring, not loosening the classifier. Loosening it would
have made the number look better and taught the wrong habit.

### W5a — the technique dimension (commit: technique layer)

- `lib/solution-strategy.ts` — six strategies, a conservative classifier
  over each item's fastest path, and per-strategy teaching notes. An
  unrecognized path is `structural`, never a guess at something more
  exotic; a wrong technique label would train a wrong reflex.
- `lib/strategy-math.ts` — the pure half: medians, per-strategy accuracy,
  and the "unreached" rule. No database, so it is tested directly.
- `lib/strategy-server.ts` — classifies the bank once per process,
  builds technique drill blocks, and joins the classification to attempt
  history.
- `/drill?strat=<strategy>` — a ten-item technique drill, round-robined
  across subtopics so *recognition* has to happen fresh each time rather
  than being given away by the set being all one topic.
- `components/analytics/technique-card.tsx` — the panel. It compares each
  technique's median time against **the user's own** structural median,
  not an absolute target, because "you are slower where a shortcut
  existed" is evidence the shortcut is not being taken, while absolute
  times would just re-measure overall speed.

**Why time and not accuracy.** The failure mode this is built to catch is
invisible to every other chart on the page: a student who grinds the
algebra correctly scores fine and runs out of clock. Accuracy says they
know the material. Only the clock says they are doing it the long way.

**What it cannot see, stated plainly:** the classifier knows which
technique was *available*, not which one the user chose. The panel's
claim is therefore inferential, and it is worded that way in the UI.

Acceptance: `pnpm test` 94/94 across 11 suites (was 73/9). Two new
suites — 11 classifier tests pinning the conservatism and the LaTeX
normalization, 10 panel-maths tests pinning the attempt floor, the
tie-counts-as-unreached rule, and that `structural` is never itself
called unreached.

### W5b — technique chapters (commit: technique chapters)

Four chapters under `content/techniques/`, rendered through the *same*
`parseLesson()` contract and the same section components as the 24
content chapters, on the same `/learn/[slug]` route. **No new top-level
nav** — the slugs are disjoint from the subtopic keys, so nothing
collides, and Learn gained a "Technique — read these first" group above
the four skill groups.

1. `technique-backsolve` — Backsolving: The Answer Is Already On The Screen
2. `technique-pick-numbers` — Picking Numbers: Turn Algebra Into Arithmetic
3. `technique-estimate` — Estimation And Bounding: Compute Only What The Choices Demand
4. `technique-bail` — Strategic Guessing: The Skill That Protects Every Other One

Four, not six: `pattern` and `eliminate` are classified and shown in
analytics but are already taught inside the content chapters that own
them, and a chapter restating that material would be duplication rather
than coverage. That decision lives in `STRATEGY_CHAPTER`, which
`lib/lessons.ts` inverts so the chapter→strategy and strategy→chapter
directions cannot drift.

A technique chapter has no subtopic, so it has no bank-derived transfer
layer and no chapter test. The three bank-built sections (top band,
recognition table, named traps) are skipped and the section numbering is
now derived from the rail rather than hardcoded — a technique chapter
reads 01–07, a content chapter still reads 01–10. That also fixed a
pre-existing mismatch: a content chapter whose bank has no top-band item
previously showed "At the top band" in the rail with no section to
match, and numbered the rest as though it were there.

Its "prove it" button goes to the technique drill
(`/drill?strat=backsolve`); `technique-bail` has no strategy — it is
about the clock, not a solution path — so its button runs a timed
section instead.

**Two mathematical defects were caught and fixed before shipping**, both
in material I wrote this session:

- `technique-backsolve` Example 3 asked for the least $n > 10$ with
  $(n^2+5n+6)/(n+4)$ an integer. It has **no answer**: $n^2+5n+6 =
  (n+4)(n+1)+2$, so the remainder is always 2. Replaced with a correct
  "which must be an integer" question whose answer is
  $(x^2+x)/2$ — which also teaches the technique's boundary, since
  expression choices mean it is *not* a backsolve.
- The pacing checkpoints were written as 36 / 27 / 18 / 9 minutes. The
  actual values of $45 - n \times 45/21$ for $n = 4, 8, 13, 17$ are
  36.43 / 27.86 / 17.14 / 8.57, so the correct rounded set is
  **36 / 28 / 17 / 9**. Corrected in three places.

Acceptance: all four chapters satisfy `parseLesson()`; `/learn` and all
four technique routes return 200; section ids render as
why/ideas/examples/cues/traps/speed/checklist for a technique and the
full ten for a content chapter; `npx tsc --noEmit` clean; `pnpm lint` 0
errors; `check-contrast` 60/60.

### W5c — closing the measured gap by authoring (commit: technique bank)

The 82.4%-structural finding is a content deficit, so the fix is items,
not a looser classifier. Thirty-six new items in three batches, each one
gated by `scripts/author/harness.mjs`:

| Strategy | Before | After | Share |
| --- | ---: | ---: | ---: |
| Backsolve | 18 | **30** | 6.3% |
| Pick numbers | 13 | **25** | 5.3% |
| Estimate | 2 | **14** | 3.0% |
| Pattern | 20 | 20 | 4.2% |
| Eliminate | 24 | 24 | 5.1% |
| Set up and solve | 361 | 361 | 76.2% |

Bank 438 → 474 verified items. **Non-algebraic technique coverage
17.6% → 23.8%.** All three chaptered techniques now fill a full ten-item
drill block spanning at least five subtopics; before this, the estimation
chapter's "prove it" button opened a two-question session.

**Verification.** Every item carries `check()` — an independent
brute-force recomputation from the stem's raw data, never from the
written solution — and the distractor gate. Two adaptations of the gate
were needed and are documented in the batch headers:

- *"Closest to" items.* Elsewhere a distractor is reachable when a named
  error computes it exactly; here the correct choice is itself rounded.
  The standard used is that the named error produces a raw value
  **strictly nearest** to its distractor and to no other choice
  (`landsOn()`), so rounding can never rescue a distractor the stated
  error does not reach. `nearestIndex()` additionally throws on a tie, so
  no shipped "closest to" item is ambiguous.
- *Universal-claim items ("must be true").* The choices are claims, not
  values, so the analogue of a computed distractor is a counterexample.
  `soleSurvivor()` sweeps every choice across a wide range of admissible
  values and requires that **exactly one** holds throughout and that each
  of the other four is **falsified by some value in the sweep** — which
  also rules out a "wrong" choice that is quietly true.

Three defects were caught by the gate and fixed before shipping: an
unparseable percent-sign choice, a cents-scaled brute force whose
floating-point rounding manufactured five spurious solutions, and a
distractor whose stated error landed on a different choice than claimed.

`tests/technique-coverage.test.ts` makes the gap non-reopenable: it reads
the seed bank directly and fails if a chaptered technique falls below a
full drill block, spans fewer than five subtopics, or if shortcut
coverage drops below 20% of the bank.

Acceptance: `verify-bank` 474/474; `pnpm test` **98/98 across 12 suites**
(was 94/11); `pnpm seed` 474 verified; every technique drill block
returns 10 items; `tsc` clean; `pnpm lint` 0 errors and 35 warnings, the
same pre-existing count as before this workstream.

### W5d — pacing checkpoints matched to even pacing (commit: checkpoints)

**A live defect, not a refinement.** The timed runner's checkpoints were
`Q7 · 30:00` and `Q14 · 15:00`. Entering question 7 means six questions
are done, which on an even split of 45 minutes across 21 questions
consumes 12.86 minutes and leaves **32:09**. A student who hit the
displayed 30:00 exactly was two minutes behind and being told they were
on time — and the same at Q14, where even pacing leaves 17:08, not 15:00.
Both errors ran in the same direction, so the section quietly taught a
student to bank time they did not have.

`lib/pacing.ts` now derives them: the target on entering question $q$ is
$\text{total} - (q-1) \times \text{total}/\text{count}$, rounded to the
nearest minute. For the full section that is **Q5 · 36:00, Q9 · 28:00,
Q14 · 17:00, Q18 · 9:00** — the same four numbers the `technique-bail`
chapter teaches, now because both compute them rather than because they
were typed to match.

Four decisions worth recording:

- **Four checkpoints, not twenty-one.** The chip appears *only* on a
  checkpoint question, never continuously. A permanent pace readout is a
  clock you watch on every question, which is the habit the system exists
  to replace.
- **A ±90-second band.** Inside it the verdict is "on pace" and the
  instruction is to change nothing. Without a band a checkpoint reads as
  a deadline and manufactures the rushing it exists to prevent.
- **Rounding is bounded by the band.** Rounding to the minute moves a
  target by at most 30 seconds — a third of the band — so it can never
  flip a verdict. A test asserts this rather than trusting it.
- **The verdict is announced.** Screen-reader users get the checkpoint,
  the deficit and the *instruction* ("take one deliberate guess on the
  next expensive question") through the existing live region.

The timed setup screen now prints the four checkpoints before the section
starts and links to the chapter that explains them, so the system is
learnable before it is needed rather than discovered at Q5.

Acceptance: `pnpm test` **109/109 across 13 suites** (was 98/12) — 11 new
tests pinning the derivation rather than the numbers, including that
rounding stays inside a third of the band, that the band is exclusive at
its edges, and that a later checkpoint always leaves less time.
`/timed` renders `Q5 · 36:00 · Q9 · 28:00 · Q14 · 17:00 · Q18 · 9:00`;
`a11y-audit` 752/752 named across 16 routes with 5 live regions;
`keyboard-pass` 13/13; `check-contrast` 60/60; `tsc` clean; `pnpm lint`
0 errors.

### W5e — tiered chapter tests (commit: chapter tiers)

**Why change something that worked.** The chapter test was one
eight-question set spanning D2–D5 at a single 75% bar. That measures the
*average* of a chapter and hides both ends of it: a student shaky on the
basics but lucky on two hard items passes, and a student solid on the
basics but not yet ready for the top band gets the same
undifferentiated "not passed". Chapter tests are not on the brief's
load-bearing list, but they are the gate behind every chapter, so the
reasoning is recorded here before the change rather than after.

Three tiers, each locked until the one below it clears:

| Tier | Window | Size | Bar |
| --- | --- | ---: | ---: |
| Foundation | D2–D3 | 6 | 5 of 6 |
| Exam level | D3–D4 | 6 | 4 of 6 |
| Top band | D4–D5 | 6 | 4 of 6 |

**The bar is highest where the questions are easiest**, which is the part
people get backwards. Missing a foundation question is a defect to
repair; missing a top-band question is a normal outcome on an exam whose
hardest items are meant to be missed by most test-takers. A chapter reads
as passed on the two required tiers — the top band is a stretch mark, not
a requirement.

**Bars are fractions, not counts, because subtopic depth is uneven.**
`interest_profit_discount` has a single item below D4;
`min_max_optimization` has none at D4 at all. A rigid blend would leave
those chapters with no runnable tier. Selection fills from the tier's own
window, then widens outward, and the bar scales to what was actually
served. Measured across all 24 chapters × 3 tiers: **72/72 tiers fill six
questions**, none unavailable.

Widening creates an honesty problem, and it is handled rather than
ignored: where the bank is thin the tier's *label* and its *questions*
diverge — `interest_profit_discount`'s "Foundation" tier is really D3–D4.
The ladder therefore prints each tier's actual range next to its name
(`Foundation · 6 · D3–D4`), so the label describes rather than claims.

**No user's record is demoted.** Sessions recorded before tiers carry
`chapter_test` with no `chapter_tier`. They are judged against the 75%
bar they were actually taken under — never re-judged against a tier bar
they were never shown — and a legacy pass credits both required tiers.
This matters concretely: a legacy 6/8 pass re-judged against the
foundation bar would need 7/8 and would silently un-pass a chapter the
user had cleared. A test asserts exactly that case.

`scripts/dev-seed-history.ts` now seeds a partly-climbed ladder (six
chapters at different rungs plus two pre-tier rows) so every state is
visible in the UI and the legacy path runs against real rows, not only in
unit tests. Verified end to end: `divisibility_gcf_lcm` (legacy 6/8) →
chapter passed; `exponents_roots_properties` (legacy 5/8) → nothing
credited; `parity_signs` (4/6 then 6/6) → passed with the retake folded;
`ratios_proportions` → foundation passed, exam last 3/6, top band shows
"Clear Exam level first · locked".

*Note on the reseed:* the guard in `dev-seed-history.ts` correctly refused
to run, reporting 4 attempts it had not created. Those were artifacts of
the `keyboard-pass.mjs` runs earlier in this session (timestamps and
`questionIds` matched the script's two drill steps). `pnpm backup` was
taken first, as the guard advises, then `--force`.

Acceptance: `pnpm test` **122/122 across 14 suites** (was 109/13) — 13 new
tests covering the bar ordering, scaling to short tiers, one-rung-at-a-time
unlocking, the refusal to unlock from a skipped tier, and the
legacy-credit rule. 72/72 tiers fill six questions; `verify-bank` 474/474;
`a11y-audit` 740/740 named with 5 live regions; `keyboard-pass` 13/13;
`check-contrast` 60/60; `tsc` clean; `pnpm lint` 0 errors.

## W6 — Cutting the navigation back

**Brief:** "Make sure that the site isn't unnecessarily complex and with
abundant tabs and such. Truly maximize inspiration from proven concepts
and best practices."

### What the audit found

Three separate navigation systems, and they disagreed with each other:

1. Desktop header — **7** entries.
2. Phone bottom bar — **5** entries, with *different labels* ("Stats" for
   what the header called "Progress") and **no Learn at all**. On a phone
   the entire curriculum could only be reached by scrolling to the top and
   using a horizontally-scrolling header.
3. Section tab bars — 3 groups, 7 tabs.

Twelve destinations, two vocabularies, one unreachable section.

Page weight told the second half of the story. Cards per route, measured:
`/analytics` **29**, `/learn` 64 (legitimate — 28 chapters), everything
else in single digits. And three of the report's surfaces answered a
question a dedicated route in the *same nav group* already owned:

| Surface on /analytics | Route that already owns it |
| --- | --- |
| Mastery grid | `/mastery` |
| Redo-queue compliance | `/queue` |
| ELO trajectories | `/patterns` |

### The cut

**Seven top-level entries → five, identical on desktop and phone.**

`Today · Learn · Practice · Review · Progress`

- **Practice** absorbs Drill, Timed, Mental math and Decision triage.
  They are all "answer questions under some condition", so they are one
  destination with four tabs rather than two top-level slots and a tab
  group. The trainers in particular held a whole nav slot for two
  mini-drills.
- **Import & backup left the nav entirely.** It is housekeeping, not a
  daily verb, and carrying it made Progress read as three equal things
  when it is two views and a settings page. It is now linked from the
  score-report card — the data it actually feeds, in both the
  imported and not-yet-imported states — so it is reachable exactly where
  someone would want it.
- **One list, used twice.** The header and the phone bar now render the
  same array, so they cannot drift again and Learn is reachable with a
  thumb.

**Duplicated surfaces moved rather than deleted.** One home per fact:

- The mastery grid moved to `/mastery`, above the ladders. Its types went
  into `lib/mastery-config.ts` rather than `lib/mastery.ts` — the chart is
  a client component, and importing the query module would drag the
  database into the browser bundle, which is the same trap `mastery-config`
  was extracted to avoid in W2.
- ELO history moved to `/patterns`, beside the trainers that generate it.
  The report had been drawing a chart about a feature it mentioned
  nowhere else.
- Redo compliance moved to `/queue` as a header line — and improved in the
  move. The report could only state the number; the queue can act on it.
  "Overdue" is now *a full day* past due rather than merely past due
  (which on that page was every row and told you nothing), matching the
  day-grain the +2/+7/+21 schedule is written in.

Their data left `gatherAnalytics` entirely, so it is no longer computed
and serialized into a page that does not render it.

### Measured before → after

| | Before | After |
| --- | ---: | ---: |
| Top-level nav entries | 7 | **5** |
| Nav vocabularies | 2 (disagreeing) | **1** |
| Sections unreachable on a phone | 1 (Learn) | **0** |
| Total destinations | 12 | **10** |
| `/analytics` cards | 29 | **23** |
| `/analytics` HTML | 441 kB | **360 kB** |

Nothing was removed from the product: every fact that left the report
gained a better home. `/mastery` 233→297 kB and `/patterns` 53→69 kB are
that content arriving where it belongs.

Acceptance: all 11 routes 200; header renders exactly 5 entries and the
phone bar the same 5; `/drill` shows the four practice tabs and
`/analytics` the two progress tabs; `pnpm test` 122/122 across 14 suites;
`a11y-audit` 738/738 named across 16 routes with 5 live regions;
`keyboard-pass` 13/13; `check-contrast` 60/60; `tsc` clean; `pnpm lint`
0 errors.

## W7 — Research pass: GMAT FE, SAT, and the learning-science literature

**Brief:** "Could you further research GMAT FE Prep material, as well as
other similar styles of test prep material such as SATs, and incorporate
various best practices, content wise, structure wise, design wise."

### What the research said

**Official GMAT Focus Edition mechanics** confirmed what Q86 already
implements: unlimited bookmarking, a maximum of three answer changes per
section within the section's remaining time, question-level adaptivity,
and a free score report carrying section scores (60–90) and percentiles.
No change needed — the Review & Edit mechanic is faithful.

**Khan Academy's official SAT course** produced two findings that Q86
failed:

1. *Every skill is taught at three levels — Foundations, Medium,
   Advanced.* This independently validates the W5e tier design
   (Foundation / Exam level / Top band), which was derived from TTP. Two
   unrelated curricula converging on three tiers is about as strong a
   signal as this kind of design decision gets.
2. *"Take a diagnostic first to establish your baseline; the
   recommendations calibrate off it."* **Q86 had no diagnostic.**
3. *From a question you got wrong, jump straight to the lesson covering
   the skill you need.* **Q86 had no such link** — the only route from a
   result to a chapter was on the chapter test, which is the one place
   you were already in the chapter.

**The interleaving literature** produced the largest single finding. In
the most-cited classroom comparison, students taught in blocked order
scored **42%** on a delayed test thirty days later; students taught the
identical material interleaved scored **74%**. The mechanism is that
under blocked practice the method stays live in working memory between
questions, so the reader never retrieves the decision "which method is
this?" — which is precisely the decision the exam tests, because on the
exam the questions arrive in no order.

**Q86's daily drill block was blocked practice.** `selectPlanDrillIds`
emitted every question of one skill before starting the next.

### W7a — Interleaving (commit: interleave)

`lib/interleave.ts`, pure and question-agnostic. The weights still decide
*how many* of each skill; the new code decides the *order*, which the old
version conflated with selection.

Plain round-robin was written first and is wrong at the tail: once the
small groups empty, the largest supplies every remaining slot, so
`[8,1,1]` comes out `a b c a a a a a a a` — seven consecutive, most of the
session. Measured, not assumed: the first implementation produced exactly
that and the test caught it.

The shipped version gives each item a position at the centre of its share
of the sequence — item *j* of a group of *n* sits at (j+½)/n — and sorts.
A group of 2 lands at ¼ and ¾; a group of 10 lands every tenth. Each
group spreads across the *whole* block regardless of size, and the result
is deterministic, so a resumed session is not reshuffled underneath the
reader.

Measured on the real daily plan (weights 4/2/4/4):

- before: `R R R R V V E E E E C C C C` — longest same-skill run **4**
- after: `R E C V R E C R E C V R E C` — longest same-skill run **1**

`minPossibleRun()` computes the theoretical floor from the group sizes, so
the tests compare the achieved run against what was actually achievable
rather than against a 1 the input may forbid.

### W7b — The miss → lesson bridge (commit: miss bridge)

`lib/miss-bridge.ts`. Khan's version sends you to the lesson; this one is
sharper, because Q86 knows something Khan's does not — *why* the question
was missed. The six error types map to different chapter sections, and
sending a calculation error to the trap gallery wastes the trip:

| Error type | Lands on | Because |
| --- | --- | --- |
| Content gap | The core ideas | the rule itself was missing |
| Setup error | Trigger cues | read right, wrong method chosen |
| Calculation error | Speed moves | method right, arithmetic broke |
| Misread | Trap gallery | this is the shape misreads are built to cause |
| Time pressure | Speed moves | the shortcut that would have bought the time |
| Guess | The core ideas | the chapter has not landed yet |

Rendered in the two places a miss is actually seen: the post-mortem
(as a card that explains the routing, and follows the *reclassified*
subtopic if the reader corrects it) and the drill result table (the
subtopic of a missed row becomes the link).

### W7c — The placement diagnostic (commit: diagnostic)

16 questions, 4 per fundamental skill, at D3, interleaved.

Q86 had two ways to acquire a baseline and neither worked on day one: an
imported score report requires having sat the exam, and the weighted plan
requires history it does not have. A new user's plan was uniform across
all four skills — the one weighting certainly wrong.

- **D3, not a spread.** A diagnostic exists to *discriminate*, and items
  nearly everyone gets right or wrong discriminate nothing.
- **Interleaved**, so it also measures what the exam measures: whether
  you can pick the method when the order gives nothing away.
- **Consumed through the existing path.** `diagnosticWeakness()` emits
  the same 0–1 weights an imported report produces, so the planner grew
  no second code path. An imported report still wins — it is the real
  exam's reading of the same four skills.
- **An unmeasured skill is 0.5, never 1.** Guessing that an unasked skill
  is weak would be the diagnostic inventing data, which is the one thing
  a baseline must not do. A test pins this.
- Today now states **what the plan is weighted against** — imported
  report, diagnostic, or "nothing yet, all four skills equal". A plan
  that cannot say where its weights came from is asking to be trusted on
  nothing.

Acceptance: `pnpm test` **139/139 across 16 suites** (was 122/14) — 10
interleaving tests including the floor comparison, 7 diagnostic tests.
Real daily block longest same-skill run 4 → 1; diagnostic selects 16/16 at
D3 with run 1. `verify-bank` 474/474; `a11y-audit` 737/737 named;
`keyboard-pass` 13/13; `check-contrast` 60/60; `tsc` clean; `pnpm lint`
0 errors.

### Sources

- GMAT Focus Edition format and score report: gmatclub.com, e-gmat.com
- Khan Academy official SAT practice design: satsuite.collegeboard.org,
  blog.khanacademy.org, makon.ai
- Interleaving vs blocked practice: pocketprep.com, the-learning-agency-lab.com,
  PMC8476370, ScienceDirect S0959475222000044

---

# Session 3 — the tier gate, the foundation band, cumulative review

**Goal.** Repair the live defect in the tier ladder, then fix the bank
depth that half-caused it, then build the cumulative interleaved review
that was identified last session and never made.

## W8 — The tier gate leaked in every chapter

### The measurement that started it

The handoff reported the leak in three chapters (`functions_sequences`
5 of 6, `min_max_optimization` 3 of 6, `rates_speed_work` 1 of 6). Before
changing anything, `scripts/check-tiers.ts` was written to measure the
property directly — every chapter, every tier pair, five independent draws
— and the defect is much larger than the sample suggested.

**Before** (`pnpm check:tiers`, at commit `0df0072`):

```
DISJOINT  chapters with any shared question: 24/24
          worst single-pair overlap: 5 of 6
          total shared slots across all pairs: 149
MONOTONE  chapters where a tier reaches past the one above: 9/24
```

Every chapter leaked. `foundation×exam` shared 2–5 questions in all 24;
`exam×top_band` shared 1–3 in 23 of 24. And a second defect nobody had
looked for: in 9 chapters the *foundation* tier served a D4 item while the
*exam* tier above it started at D3, so the ladder ran backwards.

### Root cause

Not a missing `excludeIds`. `selectChapterTest` excluded ids *within* one
tier's fill, which is all it could do — it was called once per tier, and a
tier had no way to know what the other two had taken. Disjointness is a
property of the three tiers together; the old design expressed each tier
alone, as a difficulty *window* with a widening fallback:

| Tier | Window | Fallback |
| --- | --- | --- |
| Foundation | D2, D3 | D4, D5 |
| Exam level | D3, D4 | D5, D2 |
| Top band | D4, D5 | D3, D2 |

The windows overlap at D3 and D4 by construction, and the fallbacks widen
*downward as well as upward*, which is where the backwards ladders came
from. No amount of exclusion bookkeeping fixes a model that cannot say
"these three sets partition that pool".

### D3 — tiers are bands of one ordering, not three windows

**Changing a load-bearing behaviour, so the reason is stated first.** The
tier ladder is a shipped mechanic and this changes which questions each
rung serves. The reason is that the previous rule could not hold the
invariant the rungs exist for.

Sort a chapter's verified questions by `(difficulty, id)` and cut three
contiguous bands. Foundation is the easiest band, top band the hardest,
exam the middle. Two invariants then hold *by construction* rather than by
care:

- **DISJOINT** — contiguous slices of one array share no element.
- **MONOTONE** — in a sorted array every element of a lower slice is ≤
  every element of a higher one, so a tier cannot reach past the tier
  above it.

`assignBands()` and `bandSizes()` are pure and live in
`lib/chapter-test-config.ts` (no database), so both invariants are tested
directly on synthetic chapters as well as measured on the real bank.

**Band sizes.** Three non-overlapping tests of 6 need 18 items. Above 18
the surplus splits evenly and the remainder goes to the required tiers in
ladder order, so extra depth becomes retake variety. Below 18 something
must give and it is the **top band first** — the one tier a chapter does
not need to pass — each tier shrinking only to `TIER_MIN_SIZE` before the
next is touched. `bandSizes(16) = {6, 6, 4}`; `bandSizes(32) = {11, 11, 10}`.

**What this costs, stated plainly.** "Foundation" no longer promises
D2–D3 in the abstract; it promises the easiest third of *this* chapter.
Where a chapter has no easy items that is a bank fact and the chapter page
prints the band's true range — and unlike the old sampled range, which
re-drew on every page load, it is now a stable property of the chapter.
The second cost is variety: in a chapter under 18 items the band is
exactly test-sized, so a retake is the same six. That is arithmetic, not
selection, and W9 is the answer to it.

**Also changed:** `tierShape` no longer runs a random draw to describe a
tier, and the chapter page reads one partition instead of making three
independent draws (`app/learn/[subtopic]/page.tsx`). `listQuestions()` and
a `ids` filter were added to `lib/engine.ts` so a band can be drawn from
with the existing seen-it-twice deprioritization intact.

### Measured after

```
DISJOINT  chapters with any shared question: 0/24
          worst single-pair overlap: 0 of 6
          total shared slots across all pairs: 0
MONOTONE  chapters where a tier reaches past the one above: 0/24
SIZE      chapters with a tier below the 4-question minimum: 0/24
```

| | Before | After |
| --- | ---: | ---: |
| Chapters sharing questions between rungs | 24/24 | **0/24** |
| Total shared slots | 149 | **0** |
| Worst single-pair overlap | 5 of 6 | **0 of 6** |
| Chapters with a backwards ladder | 9/24 | **0/24** |

The same audit also reports a number that is *not* a gate, because it is a
bank problem rather than a selection one: **14 of 24 chapters have a
foundation band that still reaches D4**. That is finding 2, now measured
per chapter, and it is W9's target.

Acceptance: `pnpm check:tiers` PASS (was FAIL); `pnpm test` **146/146
across 17 suites** (was 139/16) — 8 new tests covering band tiling at
every pool size 0–60, disjointness, monotonicity on six real chapter
shapes including one with no D4 at all, order-independence, and the
thin-chapter shrink order. `pnpm build` 21 routes; `verify:bank` 474/474;
`check:a11y` 739/739 named (100%) with 5 live regions; `check:keyboard`
13/13; `check:contrast` 60/60; `tsc` clean; `pnpm lint` 0 errors.

## W9 — Making the foundation tier foundational

### The measurement

W8's audit ended with a number that was honest and bad: **14 of 24
chapters had a foundation band that reached D4**. The tier that carries the
highest bar in the ladder (5 of 6, because a miss on the mechanics is a
defect rather than a normal exam outcome) was in more than half the
curriculum made partly of exam-level items.

That is the shape of the whole bank. Before this workstream: D2 **36**,
D3 124, D4 163, D5 151 — D4+D5 was **66%** of 474 items, and nine
subtopics had no D2 item at all. `interest_profit_discount` was the
extreme: **one** item below D4 out of nineteen.

### The target, computed rather than guessed

Adding an easy item also grows the foundation band, since the bands are
thirds — so the deficit does not close one-for-one. For each chapter the
requirement is `easy(n + k) ≥ bandSizes(n + k).foundation`, solved for the
least *k*. Summed over the 14 chapters: **37 items**, from 1
(`combinatorics`, `probability`, `linear_systems`,
`abs_value_number_line_decimals`) to 8 (`interest_profit_discount`).

### What was authored

37 items at D2–D3 through `scripts/author/harness.mjs`, in four batches by
fundamental skill:

| Batch | Chapters | Items |
| --- | --- | ---: |
| `batch-foundation-rates.mjs` | interest_profit_discount 8, ratios_proportions 4, mixtures_weighted_avg 3 | 15 |
| `batch-foundation-vof.mjs` | exponents_roots 3, divisibility_gcf_lcm 3, remainders_units 2, abs_value 1 | 9 |
| `batch-foundation-counting.mjs` | series_patterns 3, statistics 2, combinatorics 1, probability 1 | 7 |
| `batch-foundation-algebra.mjs` | algebraic_translation 3, functions_sequences 2, linear_systems 1 | 6 |

**A foundation item is not a small hard item.** Each one makes a single
mechanic fail loudly when it is absent — one markup applied to the wrong
base, one off-by-one between terms and steps, one exponent binding to the
wrong factor — rather than being a reduced version of a multi-step
question. The distractors are the named versions of that one mistake.

**Every check computes the answer a different way from the solution.**
Percent items are recomputed in integer cents by adding one percent at a
time, never by the composed multiplier the solution teaches; powers by
repeated multiplication; remainders by repeated subtraction; roots and
GCFs by search over the integers; medians by stripping the extremes in
pairs; translation items by searching for the value that satisfies the
*stated scenario*, since on a translation item the failure mode is the
translation and a check built on it would inherit the error.

**The gate caught one defect**, as designed: the GCF item's `24`
distractor was labelled "divides 48 but not 60", and the rule that
computes it returns 48, not 24 — 24 has no clean derivation from a single
named error. It was replaced with `4` ("takes only the shared power of 2
and drops the shared 3"), which does.

### Measured before → after

| | Before | After |
| --- | ---: | ---: |
| Bank size | 474 | **511** |
| D2 items | 36 | **58** |
| D3 items | 124 | **139** |
| D2+D3 share | 33.8% | **38.6%** |
| D4+D5 share | 66.2% | **61.4%** |
| Chapters whose foundation band reaches past D3 | **14/24** | **0/24** |
| Subtopics below 18 items (3 disjoint tiers of 6) | 3 | **3** |
| Data Sufficiency share | 13.1% | 12.1% |

Every chapter's foundation tier is now drawn entirely from D2–D3. The
audit's `FOUNDATION` line was a report in W8 and is **a gate now that it
is satisfied**: it fails the batch if a future authoring pass pushes a D4
back into an easiest band. That deliberately constrains authoring —
adding hard items to a thin chapter grows its foundation band and can pull
a D4 in — and the remedy is to add an easy item alongside, which is the
balance the ladder is supposed to have.

**Not fixed:** `min_max_optimization` and `quadratics_factoring` still
hold 16 items each, so their top band ships 4 questions rather than 6 and
a retake of any of their tiers is the same set. Closing that needs D4/D5
authoring, not D2/D3, and it does not affect either W8 invariant or the
foundation gate. `functions_sequences` reached 18 and now fills all three
tiers.

Acceptance: `pnpm check:tiers` PASS with FOUNDATION 0/24 (was 14/24);
`verify:bank` **511/511** (was 474/474); `pnpm test` 146/146 across 17
suites; `pnpm build` 21 routes; `check:a11y` 100% named with 5 live
regions; `check:keyboard` 13/13; `check:contrast` 60/60; `tsc` clean;
`pnpm lint` 0 errors.

## W10 — Cumulative interleaved review

### The gap

Q86 could prove you knew a chapter and then never ask again. A chapter
test is a gate, and a gate measures the moment you walk through it —
nothing in the platform re-opened a chapter three weeks later to find out
whether it was still there. The redo ladder covers *missed questions*; the
deck covers *takeaways*; neither covers *a chapter you passed*.

The evidence is the same evidence behind `lib/interleave.ts`: blocked
practice 42% on a delayed test at thirty days, interleaved 74% on
identical material. A cumulative review applies that at curriculum scale
rather than session scale.

### D4 — composed from what exists, not invented

Every part of this is an existing mechanism at a new grain:

| Part | Reused from |
| --- | --- |
| Spacing | `lib/redo.ts` — the +2d/+7d/+21d ladder, at chapter grain |
| Ordering | `lib/interleave.ts` — unchanged |
| Difficulty ceiling | W8's tier bands |
| Persistence | the `sessions` table, as chapter tests and diagnostics already do |

**No schema migration.** State is derived: a review session records
`{cumulative_review: true, chapters: [...]}` in `config`, and each
chapter's rung is replayed from the `bySubtopic` slice of the summary.
`question-runner.tsx` now writes `bySubtopic` beside the `bySkill` it
already wrote — always, not branched on — which is the only change to an
existing write path. The database is untouched structurally, so nothing
about the training record is at risk.

A test asserts `CHAPTER_REVIEW_STAGE_DAYS` is literally the same array as
`STAGE_DELAY_DAYS`, so a chapter and a question cannot end up on two
different schedules.

### Where it differs from redo, and why

The redo ladder resets to stage 0 on any miss. Cumulative review does not:

| Slice result | Rung |
| --- | --- |
| all correct | up one (never two) |
| some correct | **hold** — same interval, no penalty |
| none correct | back to stage 0 (+2d) |

A redo item is scheduled *because it was missed*, so a second miss is
strong evidence. A cumulative review asks about material already cleared
at the exam tier, where one slip across two questions is as likely to be
noise as decay. Resetting 21 days of spacing on it would make the ladder
unclimbable.

### Design decisions

- **Two questions per chapter, 2–5 chapters, so 4–10 questions.** It has
  to be short enough to sit *before* a new chapter rather than replace it.
  Its job is to detect decay, not to re-teach.
- **A single due chapter is not a review.** Two questions from one chapter
  in a row is blocked practice with extra steps; the interleaving is the
  point, so `REVIEW_MIN_CHAPTERS` is 2.
- **Most overdue first.** Sorted by *how long* a chapter has been due, not
  by its due date — 30 days past a 2-day interval outranks an hour past a
  21-day one, which is the ordering that matters when there are 5 slots.
- **Drawn from the whole chapter up to the ceiling, not from the band of
  the tier it passed.** A review is not a re-run of the test: the
  foundations are part of what may have decayed, and on a chapter whose
  band is exactly test-sized, drawing from the band would literally
  re-serve the test. Questions attempted in the last 7 days are skipped
  unless that would shorten the review.
- **The ceiling is the top of the band of the highest tier cleared.**
  Reviewing above the tier you cleared measures something you never
  claimed.
- **Surfaced on the Learn index, above the chapter list, only when due.**
  That is where the decision it interrupts gets made. A permanent card
  reading "nothing due" is furniture.

### Verified end to end, not only unit-tested

The review was driven through the real UI in a headless browser against
the production build: the card rendered on `/learn`, "Start review"
launched `/drill?review=1`, six questions were answered, and the database
was then read back.

Served set (interleaved, one per chapter in rotation):

```
1. divisibility_gcf_lcm   D4      4. divisibility_gcf_lcm   D4
2. percent_change_chains  D5      5. percent_change_chains  D3
3. rates_speed_work       D3      6. rates_speed_work       D5
```

Session written:

```json
config  {"cumulative_review":true,
         "chapters":["divisibility_gcf_lcm","percent_change_chains","rates_speed_work"],
         "per_chapter":2,"count":6}
summary {"total":6,"correct":3,
         "bySubtopic":{"divisibility_gcf_lcm":{"correct":0,"total":2},
                       "percent_change_chains":{"correct":2,"total":2},
                       "rates_speed_work":{"correct":1,"total":2}}}
```

Rungs after, read back from `chapterReviewStates()` — **each chapter moved
on its own slice**, which is the property the whole design turns on:

| Chapter | Slice | Rung | Next |
| --- | --- | --- | --- |
| `percent_change_chains` | 2/2 | 0 → **1** | 7 days |
| `rates_speed_work` | 1/2 | 0 → **0** (held) | 2 days |
| `divisibility_gcf_lcm` | 0/2 | 0 → **0** (reset) | 2 days |

And `reviewPlan()` then reported `available: false, waiting: 3` — the
review correctly stopped offering itself.

An abandoned session from an earlier run (no `endedAt`, null summary) was
present in the same table and correctly ignored.

### Measured before → after

| | Before | After |
| --- | ---: | ---: |
| Ways a passed chapter is revisited | **0** | 1 (spaced, interleaved) |
| Chapters in the review rotation (seeded fixture) | — | 3 of 3 passed |
| Longest same-chapter run in a served review | — | **1** (floor for [2,2,2] is 1) |
| Questions above the tier their chapter cleared | — | **0** |
| Schema migrations required | — | **0** |

Acceptance: `pnpm check:review` PASS — INTERLEAVED run 1 against a floor
of 1, CEILING 0 above, DISTINCT 6/6, SIZE 6/6, LADDER 2d → 7d → 21d.
`pnpm test` **159/159 across 18 suites** (was 146/17) — 13 new tests
covering the shared ladder, due-ness at each rung, one-rung-at-a-time
promotion, the hold rule, the empty-slice no-op, overdue ordering and its
stability, the two-chapter minimum, the five-chapter cap, and that
intervals grow. `pnpm build` 21 routes; `verify:bank` 511/511;
`check:tiers` PASS; `check:a11y` 692/692 named (100%) with 5 live regions;
`check:keyboard` 13/13; `check:contrast` 60/60; `tsc` clean; `pnpm lint`
0 errors.

*(The a11y control count is data-dependent — it counts the controls a
populated database renders, and `dev-seed-history` produces a different
number of redo-queue rows on each run. 100% named and 5 live regions are
the invariants; the absolute count is not.)*

## W11 — Sitting the placement diagnostic, and what that found

Finding 6 said the diagnostic's write-back was "unit-tested, not
observed". That distinction earned its keep: sitting one end to end found
**two live defects that no unit test could have caught**, because both are
in what the page says rather than in what the function returns.

### The observation

A clean database — no history, no test date, no imported report, which is
the exact fixture the diagnostic exists for — then the whole flow driven
through the real UI against the production build.

**Before the diagnostic:**

```
imported report baseline : null
latest diagnostic        : null
planner baselineWeakness : null
drill block              : rates 3 · VOF 3 · algebra 3 · counting 3
```

Uniform across all four skills — the one weighting guaranteed to be wrong.

**The diagnostic:** 16 questions served, 16 answered, 5 correct.

```
rates_ratio_percent              0/4
value_order_factors              2/4
equal_unequal_alg                1/4
counting_sets_series_prob_stats  2/4
```

**After:**

```
diagnosticWeakness()     {rates 1.00, VOF 0.50, algebra 0.75, counting 0.50}
planner baselineWeakness {rates 1.00, VOF 0.50, algebra 0.75, counting 0.50}
drill block              rates 5 · algebra 3 · VOF 2 · counting 2
```

The weakest skill went from 3 questions to 5; the two strongest dropped to
2 each; the ordering matches the weights exactly. **The write-back
reaches the daily plan — observed, not inferred.**

### Defect 1 — the plan would not say what it was weighted against

`baselineSource` on the Today page was gated on
`getSetting("test_date") !== undefined`, which has nothing to do with
where the weights came from. Worse, the line that reports it lived inside
a section rendered only when `plan.phase` is set, which also requires a
test date.

So a new user — no test date yet, because setting one is a separate step —
sat a sixteen-question diagnostic, had their plan silently re-weighted by
it, and was told **nothing at all**. The one surface that exists to say
"here is what this plan is based on" was unreachable in precisely the
situation the diagnostic was built to serve.

Fixed: `baselineSource` now derives only from which baselines exist, and
the card renders when there is a phase *or* a baseline, with the phase
chip conditional inside it. Verified in both directions — a clean database
with a diagnostic now reads "weighted against your placement diagnostic";
the seeded fixture with an imported report still reads "weighted against
your imported score report".

### Defect 2 — the evidence panel named a source that did not exist

`components/dashboard/plan-evidence.tsx` hardcoded the imported score
report in two places: the summary line ("the mix comes from rolling
accuracy blended with the imported report") and the per-skill reason ("the
imported score report puts this skill's weakness at 0.75"). Both are
wrong when the baseline is a diagnostic, and the first is wrong again when
there is no baseline at all — it claimed a blend with something that was
never there.

This is the worse of the two. The panel exists so the plan can be argued
with; a panel that cites a document the user has never imported is not
merely unhelpful, it invites them to go looking for a mistake that is not
theirs. It now takes `baselineSource` and names whichever source actually
produced the numbers, or says plainly that nothing has measured a baseline
yet.

Both defects predate this session; neither is reachable from a unit test,
because `diagnosticWeakness()` was correct the whole time.

### Measured before → after

| | Before | After |
| --- | ---: | ---: |
| Day-one drill weighting | 3/3/3/3 uniform | **5/3/2/2**, tracking the diagnostic |
| Diagnostic acknowledged on Today without a test date | **never** | always |
| Plan-evidence panel naming a source the user has | when a report existed | always |
| Diagnostic → plan path | unit-tested | **observed end to end** |

Acceptance: `pnpm build` 21 routes; `pnpm test` 159/159 across 18 suites;
`verify:bank` 511/511; `check:tiers` PASS; `check:review` PASS;
`check:a11y` 692/692 named (100%) with 5 live regions; `check:keyboard`
13/13; `check:contrast` 60/60; `tsc` clean; `pnpm lint` 0 errors.

*(No unit test was added for these. Both are copy conditional on render
state, and the honest check is the one that found them — sitting the flow.
`scripts/check-review.ts` and `scripts/check-tiers.ts` guard the
mechanisms; the wording is guarded by having looked at it in both states.)*

## Measured state at the end of session 3

Everything below was measured on this build, not carried forward.

| | Value | How |
| --- | --- | --- |
| Bank | 511 items · D2 58 · D3 139 · D4 163 · D5 151 | `scripts/seed-bank.json` |
| Subtopic depth | min 16 (2 chapters) · max 35 | 24 subtopics |
| Non-structural technique share | 115/511 = **22.5%** (was 17.6% of 438) | `primaryStrategy()` over the bank |
| Thinnest technique | estimate **14** (2.7%) | same |
| Exam↔top band difficulty overlap | **16/24** chapters share a range | `assignBands()` per chapter |
| Top bands that are pure D5 | **18/24** | same |
| Mean difficulty gap exam→top | **0.88** of a level; 13/24 below 1.0 | same |
| Heaviest route | `/patterns` **337 kB** First Load JS | `pnpm build` |
| Next heaviest | `/postmortem` 252 · `/drill` 241 · `/queue` 241 · `/timed` 236 · `/analytics` **233** | same |
| Data Sufficiency | 62/511 = 12.1%, labelled `DS · Data Insights` in the runner | `question-runner.tsx:431` |
| Chapters eligible for cumulative review | **3/24** on the seeded fixture (needs both required tiers passed) | `chapterReviewStates()` |
| Chapters | 24 concept + 4 technique | `content/lessons`, `content/techniques` |
| Persisted error-suggestion overrides | **0, and not persistable** — see the correction above | `tagAttempt()` |

## Next action

Finding 5 is now unblocked in a different sense than the ranked list
claimed: the first move is to **persist the suggestion alongside the
tag** so overrides become recoverable, not to wait for data that is
being discarded as it is produced. Still blocked on override data that does not
exist yet; the mechanism records it, but no real overrides have
accumulated. Finding 7 (`/analytics` First Load JS, 233 kB) and finding 3
(the 62 Data Sufficiency items) are both untouched this session and are
described in the ranked list above.
