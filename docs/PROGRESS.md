# Q86 commercial build — progress ledger

The working record across context windows. Read this, `docs/adr/`, and
`git log` before doing anything else.

**Branch:** `claude/q86-platform-overview-i29beu`
**Rule:** a claim in the "verified" column names a command that was run in
this repository and printed the result claimed. Anything else is labelled
unverified.

---

## Current milestone

**M0 — Decision record.** Complete.

## Milestone status

| # | Milestone | State | Commit |
|---|-----------|-------|--------|
| M0 | Decision record | ✅ done | see git log |
| M1 | Multi-tenancy and accounts | ⬜ not started | — |
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

## Known broken

Nothing known broken. No test framework exists yet — that is M1's first
task, and until it lands "the test suite" is not a thing that can be run.

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
  project, with the redirect URI registered.
