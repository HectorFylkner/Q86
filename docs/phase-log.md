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
