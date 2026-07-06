# Q86 Flagship Program — ledger

The program brief lives with the owner ("Q86 Flagship Program — every
surface to state of the art"). This file is the running state: what's
done (with evidence), what's next, and every decision worth remembering.
Start each session by reading this file and the git log, and by running
`pnpm test` (once it exists) and `pnpm lint`. End each session by
updating it.

## Invariants (from the brief — do not violate)

1. Local-first, single-user, no accounts; core loop works offline, no API key.
2. Verified-only serving; quality gates never loosened for quantity.
3. "The marked exam" identity: nine-token palette, drawn strokes, no confetti.
4. Exam fidelity stays as strict as the real GMAT Focus mechanics.
5. Keyboard-first on every new surface.
6. User data is inviolable; migrations preserve every row; casual sessions
   stay out of analytics/calibration/plan.

## Current phase

Workstream 1 — Trust and foundations.

## Done

- **M1: ledger + documentation drift** — this file created; the stale
  "180-question bank" claims fixed to 360 in README.md, DEPLOY.md,
  lib/db/bootstrap.ts, instrumentation.ts; scripts/seed.ts and
  scripts/seed-plan.ts headers rewritten to state honestly that the
  180-item plan is the original phase-2 plan retained only as the --api
  top-up target. A docs-consistency test (M2) guards the count from
  drifting again.

## In flight

- M2 (test infra) DONE: vitest (`pnpm test`), 8 suites / 206 tests green
  covering pacing, elo, srs, lesson contract (all 24 lessons), latex
  parsing, plan math, all 9 generators, and docs-consistency (README/
  DEPLOY counts asserted against seed-bank.json — drift now fails CI);
  .github/workflows/ci.yml runs lint → test → verify-bank →
  db:push+seed offline path → build. Two genuine defects found by the
  suite and fixed: (1) SRS "hard" stalled forever at 1–2d intervals —
  now grows ≥1 day; (2) latexChoiceToExpression bailed to null on
  cross-nested constructs like \frac{\sqrt{2}}{2}, so valid questions
  with such correct choices could never pass numeric_check — expansion
  is now innermost-first across frac/sqrt/pow. Bank re-verified after
  the parser change: all 360 pass.
- M3 (tokens/analytics): globals.css deduped (:focus-visible/::selection
  first-pass blocks removed), --on-ballpoint token added both themes and
  mapped for Tailwind; heatmap now mixes against var(--surface) with
  theme-flipped text; volume strip rebuilt as Monday-aligned week grid
  with month labels. The .bg-ballpoint.text-white hack stays until the
  primitives migration removes the last text-white-on-ballpoint site.
- M4 (primitives): components/ui/{button,card,chip,stat,key-legend}.tsx
  written; cn() upgraded to tailwind-merge (math.tsx leading- guard
  removed as obsolete); 16-file migration fan-out running.

## Next

- M2: vitest + unit tests (pacing, elo, redo, srs, lesson-parse over all
  24 lessons, latex parsing, engine helpers, plan weights, docs
  consistency) + GitHub Actions CI (lint, test, verify-bank, build).
- M3: globals.css reconciliation (duplicate :focus-visible/::selection
  blocks), --on-ballpoint token replacing the .bg-ballpoint.text-white
  dark-mode hack, analytics heatmap dark-mode fix (mix against
  var(--surface), theme-aware text threshold), week-aligned volume
  calendar.
- M4: components/ui primitives (Button/Card/Chip/Stat/SectionCard/
  KeyLegend/Stamp) + proper class-merge cn(); adopt at duplicated sites.
- M5: in-flight session persistence (drill + timed) with a resume card
  on Today and a sweep for dangling endedAt-null sessions.
- Then, remaining Workstream 1: shared verification module, migrations-
  only evolution + question UID, per-subtopic content packs, backup
  import endpoint, auth hardening.

## Decisions

- 2026-07-06 — seed-plan.ts TARGET_TOTAL stays 180: it is the historical
  §12 phase-2 plan and only feeds the deprecated --api path, which the
  repo's own audit warns against. Rewriting the plan to 360 would imply
  the --api gate is fit to grow the bank; it is not (22/43 defect audit).
  The runtime brute-force gate (Workstream 3) is the precondition for
  any new generation target.
- 2026-07-06 — Baseline established before any change: lint 0 errors /
  26 warnings, `pnpm db:push` + `pnpm seed` load 360 questions,
  `pnpm build` succeeds (Node 22.22.2, pnpm 10.33.0).

## Evidence log

- Baseline: lint/build/seed output in session transcript, 2026-07-06.
