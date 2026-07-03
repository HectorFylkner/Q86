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

## Run it

Requires Node 22.18+ (the seed script runs TypeScript via Node's native
type stripping) and pnpm.

```sh
pnpm install
pnpm db:push                   # creates ./data/q86.db
pnpm seed                      # loads the committed 180-question bank (offline, no API key)
pnpm dev
```

Open http://localhost:3000. The full training loop — drill, timed sets,
redo queue, pattern trainer, analytics, daily plan — works with no API
key: the 180-question bank ships in `scripts/seed-bank.json`, every
question verified by a programmatic brute-force check before admission.

The AI features (question twins, `/api/generate`, the post-mortem coach,
score-report import) need a key:

```sh
cp .env.example .env.local     # then add your ANTHROPIC_API_KEY
```

`ANTHROPIC_MODEL` is optional and defaults to `claude-sonnet-4-6`.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the app at localhost:3000 |
| `pnpm build` / `pnpm lint` | Production build / ESLint |
| `pnpm db:push` | Apply the Drizzle schema to `./data/q86.db` |
| `pnpm seed` | Load the committed 180-question bank into the DB — offline, idempotent (`--plan` prints the target distribution, `--api` regenerates via the AI pipeline) |
| `pnpm start` | Serve the production build (after `pnpm build`) |

Everything lives in `./data` (SQLite database, scratch-work images) —
gitignored, no accounts, no cloud.
