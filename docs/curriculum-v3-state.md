# Q86 Curriculum v3 — durable state

Last updated: 2026-07-21

## Goal and completion standard

Turn Q86's broad-subtopic Learn and practice model into a versioned,
concept-level mastery system. Completion requires stable curriculum identities,
aligned teaching and assessment, replayable question verification, concept-level
mastery/remediation, preservation of user history, and verified end-to-end flows.
Content volume or a scaffold without aligned evidence does not count.

## Working state

- Repository: `HectorFylkner/Q86`
- Working tree: `work/Q86-curriculum-v3`
- Branch: `codex/curriculum-v3`
- Base: `origin/codex/q86-command-center` at `0c2bf2d`
- Status at branch creation: clean
- Authority: local commits are allowed; push and deploy are not allowed
- Scope: GMAT Quant plus the existing Data Sufficiency bridge. The architecture
  will be section-aware, but Verbal and the remaining Data Insights formats are
  not content-generation targets in this cycle.

## Verified baseline

The remote refs were fetched immediately before this audit. All four advanced
branches remain independent descendants of `origin/main` (`f004b4d`); none
contains the full feature union.

| Branch | Head | Lessons | Bank | Test files | Distinctive strengths | Known limits |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `origin/codex/q86-command-center` | `0c2bf2d` | 24 | 360 | 3 | Current command center, navigation, question QA/quarantine, derived plan work, Node test runner | Broad-subtopic curriculum; small test suite; no learning-segment features |
| `origin/claude/q86-learning-segment-b0wljw` | `b7736ca` | 26 | 603 | 0 | Lesson commitments, persistent progress, curriculum sequencing/test-out, cue/trap retrieval, interleaving, stale/slow mastery, integrity-hardened chapter tests, two strategy chapters, visual directives | No automated test suite; still broad-subtopic mastery; divergent UI/data code |
| `origin/claude/q86-ambitious-prompt-joz85p` | `d77ae7a` | 24 | 360 | 9 | Vitest/CI, broad pure-engine coverage, session persistence, shared UI primitives, dark-mode repairs | Does not include the learning or command-center branches |
| `origin/claude/q86-gmat-quant-trainer-rz519o` | `bd9e61d` | 24 | 360 | 15 | Timed-transfer ramp, lucky-guess extraction, tiered chapter tests/recertification, execution analytics, additional engine tests | Some test-state logic trusts client summaries or partial tests; does not include later integrity fixes |

Current/default lessons contain 259 authored core ideas across 24 chapters but
only 72 worked examples. The learning branch contains 279 core ideas across 26
chapters and 78 examples. Its 603 questions cover every subtopic with at least
25 items, but questions still lack concept IDs and three subtopic/difficulty
cells are empty.

Problem Solving correct-index distribution is materially biased:

| Bank | A | B | C | D | E |
| --- | ---: | ---: | ---: | ---: | ---: |
| 360-question branches (298 PS) | 28 | 75 | 108 | 67 | 20 |
| Learning branch (496 PS) | 41 | 130 | 191 | 105 | 29 |

The source choices render in stored order, so this is observable answer-position
leakage. Data Sufficiency must retain its canonical fixed choice order and be
audited separately.

## Product facts that constrain the design

- The broad `Subtopic` taxonomy is the stable official-report and analytics
  parent. Curriculum v3 adds child concepts; it does not replace this spine.
- Current questions have only broad skill/subtopic/difficulty/format/context
  metadata. Attempts can diagnose only another broad subtopic.
- Current chapter tests draw from a broad pool rather than a concept blueprint.
- Current question authoring runs a `check()` before append, then strips it.
  `verify-bank.ts` cannot replay many mathematical proofs from the committed
  bank alone.
- The seed combinatorics item beginning “Six distinct letters A, B, C, D, E,
  F…” has a defensible key but an unacceptable solution that repeatedly changes
  the question and rationalizes toward a choice. Semantic QA must reject it.
- Current official exam semantics are Quant = Problem Solving and Data
  Sufficiency = Data Insights. Product copy must not describe DS as a current
  Quant question type.
- Public scope and product-pattern sources, their check date, and the no-copy
  boundary are recorded in `docs/curriculum-v3-sources.md`.
- The section-aware expansion contract and the gates for any future
  three-section claim are recorded in `docs/three-section-roadmap.md`.

## Feature-level integration plan

Integration is semantic, not a blanket merge or conflict strategy.

1. Preserve command-center navigation, question QA, quality routes, runtime
   quarantine, current server actions, and its non-Vitest test runner.
2. Port the learning branch in dependency order: lesson validator; persisted
   progress/curriculum inputs; remediation links; retrieval/interleaving;
   integrity-hardened mastery and chapter tests; example commitments; strategy
   chapters/directives; then the 603-question bank and authoring sources.
3. Port the strongest pure-engine tests and CI cases from the ambitious and
   trainer branches without importing their conflicting page rewrites or
   weaker client-trusted test state.
4. Add Curriculum v3 as a child layer: stable concept/misconception/question
   identities, graph validation, coverage ledger, question backfill, concept
   mastery, blueprint selection, and concept routes.
5. Prove the full vertical loop on exponents/roots, algebraic translation, and
   probability before expanding the graph to every remaining subtopic.

## Migration and preservation rules

- Never renumber or replace SQLite question primary keys used by attempts,
  edits, redo rows, deck reviews, flags, or session history.
- Add stable content UIDs alongside numeric primary keys. Backfill by a
  deterministic content fingerprint and keep aliases for intentional revisions.
- Merge the 603-question source bank by stable UID/fingerprint, not JSON array
  position. Seed changes retire absent content; they must not delete historical
  rows.
- Schema work is a triple: Drizzle schema, checked-in migration, and guarded
  idempotent evolution in `lib/db/bootstrap.ts`.
- New concept metadata must be nullable during the migration but production
  coverage validation must reject unmapped verified questions.
- Lesson/example/cue/trap/card identities must not use list ordinals.
- Chapter-test results are recomputed from server-side attempts, require a full
  blueprint, and never trust a client summary as the source of truth.
- Preserve existing local lesson progress during the move from chapter keys to
  concept keys by dual-reading and explicit backfill.
- No feature is called complete because it renders. It must have tests, coverage
  evidence, and an end-to-end learner action.

## Decisions and reasons

- **Base from command center.** It is the newest deployed-preview lineage and
  contains the question-QA work required by the brief.
- **Port learning behavior manually.** The learning branch has the strongest
  pedagogy and largest bank, but selecting it wholesale would discard the newer
  command center and all current QA surfaces.
- **Keep the existing Node test runner initially.** This minimizes dependency
  churn while tests from other branches are translated. A later test-runner
  change requires an explicit benefit and a green migration.
- **Use concepts as children of subtopics.** This preserves official-report
  continuity and historical analytics while enabling precise teaching.
- **Publish pilots only when complete.** Other inventoried concepts may remain
  explicitly `unpublished` with machine-readable shortfalls; the UI must never
  claim mastery coverage that does not exist.

## Completed work

- Refetched all remote refs.
- Confirmed the working branch is clean and based on command center.
- Reverified branch heads, lesson counts, bank counts, test-file counts, and
  Problem Solving answer-position distributions.
- Recorded the integration plan and preservation contract before product edits.
- Integrated the learning branch in reviewed feature slices while retaining the
  command-center dashboard, QA/quarantine workflow, retired-question rules, safe
  seed command, and native tests:
  - lesson parser validation and derived counts;
  - persistent chapter progress and weakest-first/test-out sequencing;
  - one-tap remediation from analytics, review, post-mortem, deck, and queue;
  - cue/trap retrieval cards and interleaved review;
  - retention-, pace-, and completion-aware chapter-test evidence;
  - answer/method commitments for worked examples;
  - visual lesson directives and the two strategy chapters;
  - all source authoring batches and the append-only 603-question bank.
- Verified that the first 360 objects in the learning bank are unchanged and
  the remaining 243 are additions; the current loader inserts all 603 without
  deleting history.
- Recorded a pilot audit for exponent/root properties, algebraic translation,
  and probability. It identifies 42 independently assessable concepts and
  shows that the current bank cannot honestly meet a six-scored-item floor for
  most of them; these shortfalls will remain visible rather than being hidden
  by undersized tests.
- Re-ran the combined baseline: 603-question mechanical bank verification,
  six native tests, lesson validation for 26 files, ESLint, and a production
  build all complete successfully. The bank result is explicitly mechanical,
  not yet evidence of replayable mathematical or semantic verification.

## Open work

1. Add the versioned curriculum graph, stable IDs, validators, and coverage
   reports.
2. Backfill question/concept metadata without changing historical numeric IDs.
3. Make deterministic verification replayable and add semantic QA; repair the
   audited combinatorics explanation.
4. Persist deterministic Problem Solving presentation permutations while
   leaving Data Sufficiency choices canonical.
5. Port the strongest automated tests and corrected tiered-test, lucky-guess,
   timed-transfer, and recertification rules from the other divergent branches.
6. Build and verify the three complete pilot concept flows.
7. Expand the inventory to every remaining subtopic and expose honest
   production/unpublished status.
8. Run migration, seed-idempotency, test, lint, build, validation, and browser
   verification matrices.

## Current risks and blockers

- The branch integrations overlap heavily in schema, actions, plan, mastery,
  navigation, and package versions. Blind cherry-picks would silently regress
  behavior.
- Existing question authoring checks are not replayable from the committed bank;
  rebuilding verifiers for legacy items is substantial work.
- Concept mappings for 603 questions require semantic review; automated mapping
  may propose candidates but cannot silently publish them.
- The full production lesson contract is intentionally much stricter than the
  current markdown. Most non-pilot concepts will initially expose real coverage
  shortfalls rather than false completion.

## Next action

Land the versioned pilot concept graph and coverage audit, stable question
identity/permutation work, and corrected assessment rules as independently
reviewable slices. Then wire those contracts into the lesson, practice,
mastery, tutor, and daily-plan surfaces, keeping under-covered assessments
unavailable with exact shortfalls.
