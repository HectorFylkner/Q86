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

Requires Node 20+ (Node 22+ recommended — the seed script uses native
TypeScript type stripping) and pnpm.

```sh
pnpm install
cp .env.example .env.local     # add your ANTHROPIC_API_KEY
pnpm db:push                   # creates ./data/q86.db
pnpm seed                      # generates 180 verified questions (resumable)
pnpm dev
```

`ANTHROPIC_MODEL` is optional and defaults to `claude-sonnet-4-6`.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the app at localhost:3000 |
| `pnpm build` / `pnpm lint` | Production build / ESLint |
| `pnpm db:push` | Apply the Drizzle schema to `./data/q86.db` |
| `pnpm seed` | Generate + verify the 180-question seed bank (`--plan` prints the distribution without API calls) |

Everything lives in `./data` (SQLite database, scratch-work images) —
gitignored, no accounts, no cloud.
