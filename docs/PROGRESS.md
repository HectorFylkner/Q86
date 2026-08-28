# Q86 commercial build — progress ledger

The working record across context windows. Read this, `docs/adr/`, and
`git log` before doing anything else.

**Branch:** `claude/q86-platform-overview-i29beu`
**Rule:** a claim in the "verified" column names a command that was run in
this repository and printed the result claimed. Anything else is labelled
unverified.

---

## Current milestone

**M1 — Multi-tenancy and accounts.** Complete.

## Milestone status

| # | Milestone | State | Commit |
|---|-----------|-------|--------|
| M0 | Decision record | ✅ done | see git log |
| M1 | Multi-tenancy and accounts | ✅ done | see git log |
| M2 | Billing and entitlements | ⬜ not started | — |
| M3 | Swedish localization | ⬜ not started | — |
| M4 | Public site and acquisition funnel | ⬜ not started | — |
| M5 | Retention | ⬜ not started | — |
| M6 | Operations | ⬜ not started | — |
| M7 | Marketing kit | ⬜ not started | — |

---

## Verified

Commands run in this session and what they printed.

| Command | Result | When |
|---|---|---|
| `pnpm install --prefer-offline` | exit 0 | M0 |
| `npx tsc --noEmit` | exit 0, no output | M0 baseline |
| `pnpm lint` | 26 problems, **0 errors**, 26 warnings (all pre-existing, all `no-unused-vars` in `scripts/author/*.mjs`) | M0 baseline |
| `pnpm lint` | exit 0 — 26 problems, **0 errors**, same 26 pre-existing warnings | M1 |
| `pnpm typecheck` | exit 0, no output | M1 |
| `pnpm test` (vitest) | **51 passed**, 4 files, 0 failed | M1 |
| `pnpm build` | `✓ Compiled successfully`, 26 routes | M1 |
| `npx playwright test` | **9 passed**, 0 failed (chromium) | M1 |
| `pnpm migrate:multitenant --dry-run` | reported 53 user-owned rows across 10 tables, wrote nothing | M1 |
| `pnpm migrate:multitenant` | backup written; counts preserved; `settings` 5 → 2 + 3 in `app_settings`; **no FK violations** | M1 |
| `pnpm claim-owner --email=… --password=…` | legacy owner claimed; 40 attempts still owned by `usr_legacy_owner`; hash is `scrypt$16384$8…` | M1 |

## Known broken

Nothing known broken.

## Test suite (established in M1)

- **Vitest** (`pnpm test`) — 51 tests over 4 files, run against a real
  libSQL database, one fresh SQLite file per test file. Only `next/headers`
  and `next/cache` are stubbed; the data layer is never mocked.
  - `migration-tenancy.test.ts` — the 0002 migration against a populated
    single-user fixture with rows in all ten owned tables.
  - `tenant-isolation.test.ts` — user B cannot read or mutate user A's rows
    through any server action.
  - `tenancy-structure.test.ts` — the choke point cannot erode: no raw
    handle outside the allowlist, no un-scoped query, no unregistered owned
    table, no trace of the old shared password.
  - `auth.test.ts` — hashing, sessions, single-use tokens, reset flow.
- **Playwright** (`npx playwright test`) — 9 tests against a production
  build. Chromium is resolved from `PLAYWRIGHT_BROWSERS_PATH`; nothing is
  downloaded.

## Decisions taken during M1 that change the product

- **Question generation is now admin-only.** `/api/generate` writes into the
  shared bank, so a subscriber generating questions would extend every
  account's bank with items that never passed the authoring harness. The
  route returns 403 to non-admins and the two UI entry points (drill setup,
  post-mortem twins) are hidden unless `role === "admin"`.
- **Flag triage is admin-only.** Reporting a question stays open to
  everyone; retiring one is adjudication over shared content.
- **`/api/export` no longer includes the question bank.** A personal export
  is the account's own rows plus the ids of questions it references.
- **`settings` split.** `model`, `seed_progress` and `user_retired_qids`
  moved to a new `app_settings` table; they configure the deployment, not a
  person.

## Baseline facts established by reading the code

- 11 tables in `lib/db/schema.ts`; none carries an owner column.
- `questions` holds the shared bank and stays global (ADR 0001).
- 11 modules import the raw `db` handle: `lib/actions.ts`, `engine.ts`,
  `analytics.ts`, `plan-server.ts`, `deck.ts`, `mastery.ts`, `decide.ts`,
  `redo.ts`, `chapter-tests.ts`, `pattern-stats.ts`, `settings.ts`
  (plus `lib/db/seed-bank.ts`, `lib/ai/model.ts`, `lib/ai/pipeline.ts`,
  `scripts/seed.ts`). These are the M1 conversion surface.
- Auth is `SITE_PASSWORD` in `middleware.ts` + `app/api/login/route.ts`.
- 24 lesson chapters, 34 326 words (`cat content/lessons/*.md | wc -w`).
- Design tokens live in `app/globals.css`: `--paper`, `--surface`,
  `--grid`, `--ink`, `--graphite`, `--ballpoint`, `--redpen`, `--amber`,
  `--highlight`; display face is Space Grotesk, body Inter, mono JetBrains.

---

## What the owner still has to supply

Nothing in this build touches live money, live DNS, or a real inbox. These
are the items only the owner can provide, collected as they arise:

- **Stripe:** a Swedish Stripe account, live publishable/secret keys, the
  three live price IDs, a webhook signing secret, Stripe Tax activated, and
  Klarna (and Swish, if available) enabled on the account. Also the
  business details Stripe requires: organisationsnummer, VAT number,
  registered address.
- **An accountant's confirmation** of the 25 % moms assumption in ADR 0003
  before live keys are used.
- **A domain**, and a decision on whether the app and the marketing site
  share it.
- **An email-sending domain** with SPF, DKIM and DMARC, plus an account at
  whichever provider M5 targets.
- **A human review of the legal pages** (integritetspolicy, köpvillkor,
  ångerrätt) before launch. They are written to be correct and specific,
  not to substitute for advice.
- **Google OAuth credentials** — a client id and secret from a Google Cloud
  project (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), with
  `<origin>/api/auth/google/callback` registered as the redirect URI. Until
  they are set, the "Fortsätt med Google" button does not render at all and
  Q86 runs on email + password.
- **`NEXT_PUBLIC_SITE_URL`** on the deployment, so password-reset links
  point at the real origin rather than `http://localhost:3000`.
- **Claiming the legacy owner** on the production database, if it holds
  pre-account history: `pnpm claim-owner --email=… --password=…` with the
  Turso credentials set. Signing up fresh instead would start from zero.
