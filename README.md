# Q86

Local-first, single-user training platform for GMAT Focus Edition
Quantitative Reasoning. The name is the target: a Quant scaled score of 86.

- AI question engine with independent verification — no generated question
  is ever served unless a second, blind solver agreed with its key
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
| `pnpm seed` | Load the committed 360-question bank into the DB — offline, idempotent (`--plan` prints the original generation plan) |
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

Avoid `pnpm seed --api` (LLM generation): its verification is an LLM
cross-solve plus numeric spot-check, and a brute-force audit found that
gate had passed 22 defective questions out of 43. If you do generate,
re-verify every new question through the authoring gate.
