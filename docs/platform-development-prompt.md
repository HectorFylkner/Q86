<!-- Q86 development brief. Paste into Claude Code (Fable 5, effort: xhigh) at the repo root to drive the next development cycle. -->

# Q86 — make it the definitive GMAT quant trainer

<context>
You are developing Q86, a local-first, single-user training platform for GMAT Focus Edition Quantitative Reasoning. Stack: Next.js 15 App Router, React 19, Tailwind 4 (CSS-first; tokens live in app/globals.css), Drizzle + libsql/SQLite, framer-motion, recharts, KaTeX, self-hosted Inter / Space Grotesk / JetBrains Mono. It is already deep: a 360-question programmatically verified bank, a 24-chapter Learn section with gated chapter tests, an exam-faithful 21-question/45:00 section simulator implementing the official Review & Edit mechanic (3-edit cap, justification gate, edit ledger), a spaced redo ladder (+2d → +7d → +21d with a day-21 cold-solve exit), a per-category ELO pattern trainer, a takeaway flashcard deck, decision-triage drills (/decide), AI score-report import, an AI whiteboard post-mortem coach, and a deterministic phase-periodized daily plan. The engines live in lib/ as pure functions; lib/taxonomy.ts mirrors the official quant score report 1:1. Read the relevant code before changing it — most of what follows is wiring existing data together, not new infrastructure, and the codebase usually already has the harder half built.

The goal: beat Target Test Prep, e-GMAT, GMAT Club, Magoosh, Manhattan Prep, and the official mba.com tools at what each does best — for one dedicated student pushing toward a Q86 quant score. At that level the battleground is execution, not content: careless errors, pacing collapse, sunk-cost questions, guess-inflated mastery. Superiority means closing those loops with data the app already captures, not adding bulk.
</context>

<identity>
Q86's DNA. Extend these; never dilute them.

1. **Trust through verification.** No question enters the bank unless its answer is recomputed programmatically from the stem (scripts/author/harness.mjs → verify-bank.ts). The repo measured its own LLM generation gate failing — 22 of 43 items defective — and demoted it. All new bank content flows through the authoring gate; AI is for orchestration and explanation (coach, report parsing), never for item generation into the bank.
2. **Honesty over flattery.** No synthetic cohort percentiles, no invented score predictions, no dopamine gamification. Official mock scores are the only calibrated anchor; in-app data supplies leading indicators framed as "what's still leaking points," with stated uncertainty.
3. **Official-report fidelity, quant-only by decision.** The verification moat doesn't extend to Verbal, and depth on the last-points problem beats section breadth. The 62 data-sufficiency items genuinely train a slice of Data Insights — say so honestly in the UI rather than expanding sections.
4. **"The marked exam" art direction.** Exam paper, graphite, ballpoint ink, reviewer's red pen: nine semantic tokens, the 24px graph-paper grid, blue-not-green correctness, hand-drawn check/cross strokes, three role-separated typefaces with tabular numerals, restrained thematic motion, no confetti, a complete night-desk dark mode, coaching-voice empty states. Every new surface must look drawn by the same hand.
5. **Advisory, not coercive; keyboard-first.** Ladders and gates say where to work; they never forbid working elsewhere. Every new flow ships with keyboard bindings, dark-mode parity, reduced-motion respect, and phone-tab-bar layout parity.
</identity>

<work>
Sequenced by impact. Go deep rather than wide: a loop that fully closes — capture → analyze → prescribe → measure again — beats three half-features. Stopping before the menu is exhausted is fine; shipping shallow versions of everything is not.

**Tier 1 — close the execution loop (the plateau breakers)**

1. *Timed-transfer ramp.* Per-subtopic-per-difficulty time budgets that tighten automatically as recent accuracy holds: untimed mastery → soft cap → exam pace. lib/pacing.ts benchmarks, attempts.time_seconds, and mastery cells all exist. "90% accuracy untimed, collapse under the clock" is the most-cited practice-to-test gap in every community debrief; the expert protocol — shrink the timer only after accuracy is proven — has never been productized.
2. *Lucky-guess extraction.* A guessed-correct currently counts the same as a locked-correct everywhere. Route low-confidence corrects into the redo queue and deck, and discount them in mastery rungs and plan weights. Every attempt already carries the confidence tag; this closes an honesty hole that inflates every downstream metric.
3. *Bail training as a closed loop.* /decide results are write-only today. Join them with real timed-set behavior in analytics — "you spent 3:10 on a D5 counting question your record solves 38% of the time; your own triage call was bail" — and trend sunk-cost violations over time. Community consensus is that one 3-minute question ruins a section; no platform measures the skill, and both datasets already exist here.
4. *Careless-error forensics.* Recurrence-rate trends per error mechanism ("is my calculation_error rate falling?"), a misread / answered-the-wrong-question distinction in the taxonomy, and one-click drill sets assembled from the questions where a given slip historically occurs. At the top of the scale one careless miss erases weeks of work; execution forensics is what this student needs most.
5. *Terminate every miss in instruction.* Deep-link the solution panel and the coach's prescriptions to the exact Learn chapter and section, and add a second analytics heatmap keyed on attempts.error_subtag — the "subtopic that actually failed," which the coach already sets and no view reads.

**Tier 2 — make stored data speak**

1. *Longitudinal pacing analytics* in the official score report's language: quarter-bucket section replay exposing fatigue and end-of-section rushing, time-sink and rushed-wrong trends across weeks, average-vs-benchmark per difficulty over time, and the edit-net trend folded in. The per-set pacing read in the marking summary is excellent and then discarded; session summaries, per-attempt timing, and imported official per-question timing rows are all stored and never re-read.
2. *Official-asset scarcity ledger.* Only six uncontaminated official mocks exist per student, ever. Track consumed vs remaining, warn on retake contamination, schedule them into the plan (the T-35/21/10 reminders exist), and ingest every imported report as a calibration checkpoint rather than only the latest.
3. *Readiness panel.* A conservative "what's still leaking points" read anchored to official mock scores, overlaid with the leading indicators the score can't see: pacing-violation trend, edit net, careless recurrence, D4/D5 accuracy under time. State uncertainty plainly; never emit a predicted score.
4. Give the cheapest write-only columns a reader: twin lineage (the pure-vs-real twin performance comparison was the feature's premise) and pattern-attempt ms (speed trends per category, not just ELO).

**Tier 3 — the best mechanic from each rival, adapted**

- *From TTP* (the category's most-awarded course): difficulty-tiered chapter tests — easy/medium/hard rungs at a ~85% bar — plus spaced re-certification: a chapter passed in week 1 gets re-verified when stale or when recent drill accuracy dips, surfaced as a daily-plan item. The chapter-test machinery exists; add tiers and staleness.
- *From GMATWhiz*: failure-triggered step-down rebuild — a failed rung or chapter test auto-offers a one-click rebuild set (six questions one difficulty down plus the relevant lesson section) instead of a bare fail verdict. The ?sub&d deep links already exist; this is assembly.
- *From the error-log culture GMAT Club built and Manhattan's Navigator productized*: cross-source capture — a fast entry form for misses on external material (official mocks, Official Guide): subtopic, difficulty, error tag, optional stem note and scratch photo, feeding the same redo ladder, deck, error log, and coach. The student's highest-signal misses happen outside the app and currently die in spreadsheets; a stub-question row or nullable question reference absorbs this.
- *From the community's plateau consensus*: review-before-volume — the daily plan sequences due redos and deck cards ahead of new drill volume, with a soft gate on the drill card ("clear 6 due redos first"). Nudge, not lock.
- *From the official exam's own psychology*: pressure-exposure modes — a "one shot" section sim (no retake today; the result stands), a test-day warm-up protocol, and a rough-start recovery drill that seeds early hard questions. Mock-to-test drops of 40–70 points dominate r/GMAT; the exam-faithful mechanics already here are the substrate.

**Tier 4 — repairs (each verified in code)**

- Redo silent-drop: a wrong answer during a redo session on a question with no open queue item never re-enters the queue (lib/actions.ts logAttempt only enqueues for non-redo modes; lib/redo.ts applyRedoResult returns early when no open item exists).
- Local-day math uses the server timezone throughout (volume calendar, streaks, plan cadence, timed-set-day flips) — on the recommended UTC deploy, day boundaries misalign with the user's midnight.
- Dark-mode contrast: the bg-redpen "Commit the change" button misses the white-text fix (~2.5:1 on night redpen), and the miss heatmap color-mixes toward literal white, washing out night cells.
- gatherAnalytics issues an unbounded all-attempts select for the confidence map and its session/question map key silently last-write-wins on repeats; countQuestions ignores excludeIds so availability counts overstate.

**Tier 5 — visual sharpening (systematize; the art direction is right and stays)**

- Extract the shared primitives the app already implies: the ballpoint button class string is copy-pasted ~25 times across 14 files with visible drift, there are two local Chip components and four near-identical stat tiles. One Button, one Chip, one StatTile — each matching the best existing instance.
- Route-level loading.tsx and error.tsx: every page is force-dynamic with zero pending feedback while a polished .skeleton primitive sits unused.
- Finish the motion vocabulary in the existing 0.15s/0.22s register: the deck flashcard flip (the one component begging for it), height/opacity disclosure transitions, and tune or disable recharts' stock entrance animations, which sit outside the curated vocabulary.
- Enforce the two radius tokens against the ad-hoc radii that leaked in; settle one icon convention; make the dark token set single-source; dedupe the duplicated :focus-visible and ::selection rules (the later block currently overrides the earlier one silently).
</work>

<engineering_floor>
The pure engines (plan, redo, srs, elo, pacing, mastery, decide) have zero tests despite being written for testability — add a lightweight runner (node:test fits this repo's zero-framework ethos) and cover them plus every new engine you write. Keep pnpm build and pnpm lint green at every commit; keep the app bootable from a fresh pnpm db:push && pnpm seed. Schema changes go through Drizzle with a migration story for the existing gitignored database. Match the surrounding idiom, comment density, and the product's coaching voice — empty states speak like a coach, not a placeholder.
</engineering_floor>

<working_agreement>
You are running unattended: proceed on reversible decisions, and commit in coherent milestones with the app runnable at each. Audit every progress claim against actual tool output before reporting it — if tests fail, say so with the output. Before finishing: build, lint, and tests green; a fresh seed boots; README updated where behavior changed, including the stale "180-question bank" copy — the shipped bank is 360. Your final summary leads with what the student can now do that they couldn't before.
</working_agreement>
