# Q86

Local-first, single-user training platform for GMAT Focus Edition
Quantitative Reasoning. The name is the target: a Quant scaled score of 86.

- AI question candidates get an independent model cross-solve, then remain
  quarantined until a human completes the three-part Question QA checklist
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
360-question bank into it — offline, no API key:

```sh
pnpm install
pnpm db:push
pnpm seed
pnpm dev
```

Open http://localhost:3000. The full training loop — drill, timed sets,
redo queue, pattern trainer, analytics, daily plan — works with no API
key: the 360-question bank ships in `scripts/seed-bank.json`, every
question verified by a programmatic brute-force check before admission.

The AI features (quarantined question candidates and twins, the post-mortem
coach, score-report import) need a key — copy the template and fill in
`ANTHROPIC_API_KEY`. Generated candidates never enter drills automatically;
review them under **Progress → Question QA** first.

```sh
cp .env.example .env.local
```

`ANTHROPIC_MODEL` is optional and defaults to `claude-sonnet-4-6`.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the app at localhost:3000 |
| `pnpm build` / `pnpm lint` | Production build / ESLint |
| `pnpm test` | Run plan and retired-question integrity tests |
| `pnpm db:push` | Apply the Drizzle schema to `./data/q86.db` |
| `pnpm seed` | Load the committed 360-question bank into the DB — offline, idempotent (`--plan` prints the target distribution) |
| `pnpm start` | Serve the production build (after `pnpm build`) |
| `pnpm backup` | Snapshot the local database (history, ELO, scratch photos — all one file) into `./backups`, safe while the app runs |

Everything — attempt history, ELO, scratch-work photos — lives in one
SQLite database at `./data/q86.db`, gitignored, no accounts, no cloud.
`pnpm backup` snapshots it.

Want it as a website instead of localhost? See [DEPLOY.md](DEPLOY.md) —
free Vercel + Turso hosting (push-to-deploy, password gate) is the
recommended path; a Dockerfile + Fly.io config ship as the alternative.

## Extending the question bank

New questions enter `scripts/seed-bank.json` only through the authoring
gate in `scripts/author/harness.mjs`: each item carries a `check()` that
recomputes the answer from the stem's raw data by brute force, and the
item is rejected unless the check agrees with the keyed choice. Start
from `scripts/author/example-batch.mjs`. After appending, run
`node --experimental-strip-types scripts/verify-bank.ts` (structural
re-verification of the whole bank) and `pnpm seed` (loads new items,
retires removed ones). The flag is needed below Node 22.18 because these
tools import the app's TypeScript modules directly.

`pnpm seed --api` is disabled. Its former LLM cross-solve plus numeric
spot-check admitted 22 defective questions among 43 candidates in a
brute-force audit. Generate model-checked candidates from Drill or a
post-mortem instead; they stay quarantined until explicit human approval.
Programmatically verified additions still go through `scripts/author/`.

## Extending the lessons

Chapters in `content/lessons/` are written against a strict dialect
(seven `##` sections, exactly 3 worked examples, arrow-split trigger
cues — see `lib/lesson-parse.ts`); a chapter that deviates falls back to
a generic markdown render and loses its structured layout, its example
commitments, and its cue/trap retrieval cards. The lesson counterpart
to `verify-bank.ts` is

```sh
node --experimental-strip-types scripts/validate-lessons.ts
```

which parses every chapter, re-asserts the section minimums, checks
visual directives, prints per-file diagnostics, and exits non-zero on
any failure. Run it after touching any lesson file, exactly as
`verify-bank.ts` runs after any bank change.

Chapters are keyed by taxonomy subtopic (filename = route param =
progress key); the two strategy chapters
(`data_sufficiency_discipline`, `choosing_fastest_path`) extend that
chapter namespace without touching the question taxonomy. Where a
picture is the method, the dialect offers three named directives —
`::set-matrix`, `::number-line`, `::rate-timeline` on their own line
(grammar in `lib/directives.ts`) — anything malformed degrades to
literal text. No general HTML or images, ever.
