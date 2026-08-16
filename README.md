# Q86

Local-first, single-user training platform for GMAT Focus Edition
Quantitative Reasoning. The name is the target: a Quant scaled score of 86.

- A committed bank of 464 problem-solving questions, every one admitted
  only after code recomputed its answer from the stem's raw data by brute
  force — never on an LLM's say-so
- 24 concept chapters with a strategy playbook, and a spaced deck fed from
  both sides: the takeaway of every question you miss, and the cues, traps
  and concept checks of every chapter you cement
- Chapter tests that draw a real easy-to-exam-hard blend and prefer
  questions you haven't seen on a previous take
- Miss-to-prescription: tag a miss with its error type and the cure is one
  click away — the chapter, its cue list, its speed moves, or the playbook
  note that owns that failure mode
- Drill mode and full-section simulation with the official Review & Edit
  mechanic (max 3 edits, justification gate, edit ledger)
- Whiteboard post-mortem: photograph your scratch work, get a coaching
  card that names the exact line where the work went wrong
- Spaced redo queue (+2d → +7d → +21d, day-21 cold-solve gate)
- Deterministic rapid-fire pattern trainer with per-category ELO
- Analytics mirroring the official score-report format, plus a
  deterministic daily plan
- Session focus tags: mark a drill or timed set "casual" and it stays
  out of analytics, calibration, and the daily plan — misses still
  join the redo queue

## Run it

Requires Node 22.6+ (the seed script runs TypeScript via Node's native
type stripping; the scripts pass `--experimental-strip-types`, which is
default from Node 22.18) and pnpm.

`pnpm db:push` creates `./data/q86.db`; `pnpm seed` loads the committed
question bank into it — offline, no API key:

```sh
pnpm install
pnpm db:push
pnpm seed
pnpm dev
```

Open http://localhost:3000. The full training loop — read a chapter,
cement it in the deck, drill, chapter tests, timed sets, redo queue,
pattern trainer, analytics, daily plan — works with no API key: the
464-question bank ships in `scripts/seed-bank.json`, every question
verified by a programmatic brute-force check before admission.

The AI features (question twins, `/api/generate`, the post-mortem coach,
score-report import) need a key — copy the template and fill in
`ANTHROPIC_API_KEY`:

```sh
cp .env.example .env.local
```

`ANTHROPIC_MODEL` is optional and defaults to `claude-sonnet-4-6`.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the app at localhost:3000 |
| `pnpm build` / `pnpm lint` | Production build / ESLint |
| `pnpm db:push` | Apply the Drizzle schema to `./data/q86.db` |
| `pnpm seed` | Load the committed bank into the DB — offline, idempotent (`--plan` prints the target distribution) |
| `pnpm verify` | All three content gates: bank, coverage, chapters |
| `pnpm verify:bank` | Re-verify every bank question mechanically (structure, key, scope) |
| `pnpm verify:coverage` | Fail if any subtopic can't serve its chapter test twice with no repeats |
| `pnpm verify:lessons` | Fail if any chapter drifts off the parser contract that feeds the card packs |
| `pnpm start` | Serve the production build (after `pnpm build`) |
| `pnpm backup` | Snapshot the local database (history, ELO, scratch photos — all one file) into `./backups`, safe while the app runs |

Everything — attempt history, ELO, scratch-work photos — lives in one
SQLite database at `./data/q86.db`, gitignored, no accounts, no cloud.
`pnpm backup` snapshots it.

Want it as a website instead of localhost? See [DEPLOY.md](DEPLOY.md) —
free Vercel + Turso hosting (push-to-deploy, password gate) is the
recommended path; a Dockerfile + Fly.io config ship as the alternative.

## Content layout

| Path | What it holds |
| --- | --- |
| `content/lessons/*.md` | 24 concept chapters, one per subtopic, on a fixed seven-section template |
| `content/strategy/*.md` | The strategy playbook — the four notes the prescription loop routes to |
| `scripts/seed-bank.json` | The question bank (committed, verified, problem-solving only) |

Chapters are the single source of truth for chapter-derived spaced-repetition
cards: `lib/lesson-cards.ts` parses each chapter's trigger cues, named traps,
and pre-drill concept checks at read time, and only a content-derived card id
plus its scheduling state is ever stored. Edit a chapter and its cards follow;
rewrite a card and it retires the old schedule and starts fresh, which is the
honest behaviour for a cue that now says something different.

## Extending the question bank

New questions enter `scripts/seed-bank.json` only through the authoring
gate in `scripts/author/harness.mjs`: each item carries a `check()` that
recomputes the answer from the stem's raw data by brute force, and the
item is rejected unless the check agrees with the keyed choice. Start
from `scripts/author/example-batch.mjs`. After appending, run `pnpm
verify` and then `pnpm seed` (loads new items, retires removed ones).

Scope, enforced by the gates rather than by convention:

- **Problem solving only.** The Focus Quant section contains no Data
  Sufficiency — that format sits in Data Insights — so the bank holds
  none, and both `harness.mjs` and `verify-bank.ts` reject it.
- **Difficulty D2–D5.** D1 is retired: nothing on a real section sits
  below the D2 time benchmark, and sub-D2 automation is trained by the
  pattern trainer instead. Legacy D1 rows still resolve — benchmarks read
  through `benchSeconds()` in `lib/pacing.ts`, which clamps into range.
- **Coverage floor per subtopic: D2 ≥ 4, D3 ≥ 6, D4 ≥ 4, D5 ≥ 2.** That
  is the chapter-test blend twice over, so a retake never repeats a
  question. `pnpm verify:coverage` fails loudly on any shortfall; before
  it existed, the selector padded a starved blend silently and you found
  out mid-test.

Removing a question is the same pipeline in reverse: delete it from the
bank file and run `pnpm seed`. Rows are retired (`verified = false`),
never deleted, so attempt history keeps resolving.

Avoid `pnpm seed --api` (LLM generation): its verification is an LLM
cross-solve plus numeric spot-check, and a brute-force audit found that
gate had passed 22 defective questions out of 43. If you do generate,
re-verify every new question through the authoring gate.
