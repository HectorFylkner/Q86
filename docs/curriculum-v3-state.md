# Q86 Curriculum v3 — durable state

Last updated: 2026-07-21

## Goal and completion standard

Turn Q86's broad-subtopic Learn and practice model into a versioned,
concept-level mastery system. Completion requires stable curriculum identities,
aligned teaching and assessment, replayable question verification, concept-level
mastery/remediation, preservation of user history, and verified end-to-end flows.
Content volume or a scaffold without aligned evidence does not count.

## Working state

- GitHub repository: `HectorFylkner/Q86`
- Vercel project: `q86` (`prj_4NZz5obQB6brQzMYniGO2lpgKOpz`), Next.js,
  with `q86.vercel.app` assigned. The latest observed ready preview is
  `dpl_BkPcwPQhSixkqAq3dZdN1YTsTZoS` from command-center commit `0c2bf2d`;
  this curriculum branch has not been pushed or deployed.
- Working tree: `work/Q86-curriculum-v3`
- Branch: `codex/curriculum-v3`
- Implementation head verified by this record: `ab621ba` (the state-only commit
  that records these results follows it).
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

| Branch | Head | Lessons | Lesson words | Bank | Test files | Distinctive strengths | Known limits |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `origin/codex/q86-command-center` | `0c2bf2d` | 24 | 34,759 | 360 | 3 | Current command center, navigation, question QA/quarantine, derived plan work, Node test runner | Broad-subtopic curriculum; small test suite; no learning-segment features |
| `origin/claude/q86-learning-segment-b0wljw` | `b7736ca` | 26 | 38,207 | 603 | 0 | Lesson commitments, persistent progress, curriculum sequencing/test-out, cue/trap retrieval, interleaving, stale/slow mastery, integrity-hardened chapter tests, two strategy chapters, visual directives | No automated test suite; still broad-subtopic mastery; divergent UI/data code |
| `origin/claude/q86-ambitious-prompt-joz85p` | `d77ae7a` | 24 | 34,759 | 360 | 9 | Vitest/CI, broad pure-engine coverage, session persistence, shared UI primitives, dark-mode repairs | Does not include the learning or command-center branches |
| `origin/claude/q86-gmat-quant-trainer-rz519o` | `bd9e61d` | 24 | 34,759 | 360 | 15 | Timed-transfer ramp, lucky-guess extraction, tiered chapter tests/recertification, execution analytics, additional engine tests | Some test-state logic trusts client summaries or partial tests; does not include later integrity fixes |

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
- All 603 seed questions now have stable UIDs and content versions. Seventy-eight
  pilot questions have current reviewed primary concept mappings (plus 15
  secondary mappings); the remaining 525 are explicitly unresolved at leaf
  level. Question and lesson misses can now create exact concept remediation.
- Legacy chapter tests still draw from broad subtopic pools. Curriculum v3 has
  explicit, versioned pilot blueprints, but certification execution remains
  closed until their proof and item-family slots can be filled.
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
- Added a versioned child-concept graph and coverage ledger: all 279 core ideas
  are dispositioned as 267 canonical concepts plus 12 deliberate merges, with
  272 total concept records and no missing prerequisite references or cycles.
- Completed the structured teaching contract for all 43 pilot leaves: 14
  exponent/root concepts, 13 algebraic-translation concepts, and 16 probability
  concepts. Their registered micro-lessons contain 129 stable worked examples,
  258 graded retrieval checks, 43 prerequisite checks, 129 named
  misconceptions, and 1,548 progressive hints. The merged graph exposes 138
  examples, 279 checks, and 152 misconceptions after legacy evidence is
  retained. These are teaching-contract counts, not learning-effectiveness or
  mastery claims.
- Added independently addressable concept routes, answer/method commitment,
  “I don't know yet,” progressive hints, correction capture, immutable learning
  evidence, prerequisite links, exact-concept practice, and an honest coverage
  UI. The other 229 concepts remain `source_only` with explicit shortfalls.
- Added three exact-roster assessment specifications covering 14/13/16 pilot
  concepts. Seven distinct stages per leaf—diagnostic/test-out, easy, medium,
  hard, short-delay, long-delay, and timed Problem Solving transfer—produce 301
  no-repeat slots. The pilot proof floor is therefore seven distinct families,
  above the global floor of six. This is a validated blueprint specification,
  not an open certification runtime.
- Added provisional 90%/80%/70% tier policies, exact-roster server scoring,
  full-completion checks, sibling/recent-item exclusion hooks, hint/guess
  independence rules, timed-transfer eligibility, and stale/recertification
  transitions. The legacy chapter UI remains explicitly on its existing 75%
  threshold until concept blueprints and tier state are persisted.
- Added stable non-positional UIDs and positive content versions to all 603
  seed questions, immutable question-revision snapshots, guarded migration,
  and stable-UID seed reconciliation. A legacy-fixture test preserves numeric
  question ID 86 and its attempt foreign key, leaves an unrelated generated
  same-stem row untouched, and proves a repeated load creates no new revision.
- Added semantic-static QA and numeric answer-alignment evidence for 434 of 496
  Problem Solving questions. This evidence validates the keyed numeric value;
  it is not a replayable stem-to-key mathematical proof. Under the stricter v3
  gate, 0/603 questions currently have certification-grade replayable proof;
  62 PS and all 107 DS items remain structural-only.
  Repaired the audited six-letter fixed-order explanation, the narrated 60 L
  mixture self-correction, and invalid witnesses in an exponent DS fastest
  path.
- Persisted deterministic per-session Problem Solving answer permutations while
  keeping Data Sufficiency canonical. Immutable `session_items` freeze question
  UID/version, position, blueprint slot, and display-to-canonical order;
  progression waits for attempt persistence, failed saves are retryable, and
  session closure ignores client summaries and requires exactly one server
  attempt for every roster item.
- Added migrations `0005_question_identity.sql`, `0006_concept_evidence.sql`,
  and `0007_session_item_runtime.sql`, each paired with guarded bootstrap
  evolution. Existing numeric question IDs and history references remain in
  place.
- Materialized 93 reviewed mapping rows for the 78 pilot questions. Exact
  diagnosis uses only the latest mapping for the current question content
  version; a newer draft or retired mapping closes that item instead of falling
  back to stale reviewed metadata.
- Routed wrong, slow, hinted, guessed-correct, and changed-from-correct responses
  to concrete concept actions. One action can be cleared only by a newly bound,
  previously unrostered/unattempted question family answered correctly,
  independently, and within the pace guardrail. Resolution evidence records the
  session item, content and mapping versions, variant family, confidence, and
  time; it never creates a mastery or certification transition. If no fresh
  family exists, the action remains open with an explicit shortfall.
- Current checks pass for graph/coverage, all 43 lesson contracts, immutable
  answer ordering, mapping sync, remediation creation/resolution,
  guessed-answer non-resolution, server-recomputed session closure, and the
  drill persistence barrier.
- Repaired a phone-width overflow exposed by long formal expressions and stable
  concept IDs. Lesson grid children now opt out of min-content expansion, IDs
  wrap only when necessary, and the final 390 px checks have no document-level
  horizontal overflow.

## Verification record

All commands below ran on the local `codex/curriculum-v3` branch. The browser
matrix used a newly bootstrapped temporary SQLite database; it did not read or
modify the normal project database.

- `pnpm install --frozen-lockfile`: lockfile current; install succeeded.
- Existing-fixture evolution, fresh migration, and identity migration: 3/3
  passed. The legacy fixture preserved question ID 86 and its attempt foreign
  key, and a repeated evolution was idempotent.
- Fresh database plus two explicit seed passes: 603 trusted questions, 603
  immutable revision snapshots, 93 reviewed mapping rows, and 8 applied
  migrations after both passes; neither repeat inserted or retired a question.
- `pnpm test`: 51 native tests plus 27 Vitest tests, 78/78 passed.
- `pnpm exec tsc --noEmit`: passed. The retired-question deck assertion now
  checks the actual `DeckCard` discriminant and ID rather than a nonexistent
  property.
- `pnpm lint`: 0 errors and 3 warnings, all in unchanged source-authoring batch
  scripts for unused local variables.
- `pnpm build`: Next.js production compilation, type validation, page-data
  collection, and all 8 static pages completed successfully.
- Lesson validator: 26 files, all 24 taxonomy subtopics covered, all chapters
  valid against the rendering dialect.
- Curriculum validator: 272 concepts, 279 idea dispositions, 78 mapped and 525
  explicitly unresolved questions, 43 teaching-complete segments, 0
  certification-ready concepts, and 0 replayably verified scored items; all
  graph and readiness assertions passed.
- Bank verifier: all 603 questions passed mechanical and semantic-static QA;
  434/496 PS items have numeric answer-alignment evidence.
- Browser matrix: desktop and 390 x 844 phone layouts in light and dark modes
  covered `/coverage`, the exact concept lesson, `/drill`, and `/queue`. Pages
  had meaningful content, no Next.js error overlay, no browser errors, and no
  document-level overflow after the responsive repair. Wide ledgers remain
  locally scrollable by design.
- Browser evidence loop: a correct lesson response using a hint created one
  exact action; a separate unseen, focused, confidence-locked correct question
  resolved it without creating a certification transition. A deliberately
  wrong locked response likewise created a `WRONG` action for the same exact
  concept and a third unseen family resolved it. Finishing a question session
  produced a server-derived roster summary.
- Browser exhaustion boundary: after all three reviewed families for the sample
  concept had been rostered, another hinted action remained open and the drill
  route stated that no fresh aligned item was available. It did not recycle a
  family or grant mastery. The concept page simultaneously showed assessment
  unavailable at 0/7 replayably verified items.

## Open work

1. Author source-controlled proof specifications that replay every stem-to-key
   result, including DS sufficiency classifications; numeric answer alignment
   alone cannot open certification.
2. Add enough reviewed, distinct variant families to fill every pilot's seven
   no-repeat stages across three difficulty bands and two surface forms. Today,
   2/43 pilot leaves have no raw mapped item, 22 have one, and only one has at
   least seven; none has seven replayably verified families.
3. Implement the still-closed certification executor: maximum-matched blueprint
   selection, frozen revision scoring, pre-answer assistance joins, append-only
   results/transitions, delayed-review scheduling, timed transfer after accuracy,
   and derived chapter state. Do not open a tier until its exact roster exists.
4. Add exposure events for learning items and any richer tutor surface so their
   remediation can use the same strict unseen/independent resolution rule.
5. Expand the 229 source-only concepts and curate the 525 unresolved question
   mappings, including the two strategy chapters, without manufacturing shallow
   Verbal or remaining Data Insights content.

## Current risks and blockers

- Existing question authoring checks are not replayable from the committed bank;
  rebuilding verifiers for legacy items is substantial work.
- The 78 pilot mappings are reviewed and current, but 525 questions remain
  deliberately unresolved. Automated candidates cannot silently publish them.
- The raw pilot pool is too thin even before proof filtering: 41/43 leaves have
  any mapped item, 40/43 lack three raw difficulty bands, all 43 lack two mapped
  surface forms, and 0/43 can fill the seven replayable stages.
- Twenty-two pilot concepts have only one mapped question, so a miss can consume
  the only family and leave no honest fresh resolver. The queue must keep those
  actions open until the bank expands.
- “Lesson `production_ready`” applies to 43 teaching segments; end-to-end
  `productionReady`, assessment-eligible, and certification-ready counts remain
  zero. Using the bare phrase “production-ready concepts” would conflate these
  states.

## Next action

Author replayable proof specifications and distinct item families against the
301-slot ledger, beginning with the two zero-item leaves and the 22 one-item
leaves. Only after those cells are real should the frozen certification executor
be implemented and any tier opened.
