# Q86 commercial build — progress ledger

The working record across context windows. Read this, `docs/adr/`, and
`git log` before doing anything else.

**Branch:** `claude/q86-platform-overview-i29beu`
**Rule:** a claim in the "verified" column names a command that was run in
this repository and printed the result claimed. Anything else is labelled
unverified.

---

## Current milestone

**M3 — Swedish localization.** Complete. sv-SE is the default with English
behind a toggle, no user-facing string is hard-coded, dates/numbers/prices
format as sv-SE, the locale is stored on the account, and all 24 lesson
chapters exist in Swedish with the English originals kept behind the
toggle. The exam-fidelity boundary holds: question stems, answer choices
and Data Sufficiency statements are English in both locales.

M2's one open item is unchanged — a purchase against Stripe's own test
mode needs keys this environment does not have, and is written up as a
runbook in `docs/BILLING.md` rather than claimed as verified.

## Milestone status

| # | Milestone | State | Commit |
|---|-----------|-------|--------|
| M0 | Decision record | ✅ done | see git log |
| M1 | Multi-tenancy and accounts | ✅ done | see git log |
| M2 | Billing and entitlements | ✅ done (see the Stripe caveat) | see git log |
| M3 | Swedish localization | ✅ done | see git log |
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
| `pnpm lint` | exit 0 — 0 errors, 26 pre-existing warnings | M2 |
| `pnpm typecheck` | exit 0, no output | M2 |
| `pnpm test` (vitest) | **83 passed**, 7 files, 0 failed | M2 |
| `pnpm build` | `✓ Compiled successfully` | M2 |
| `npx playwright test` | **16 passed**, 0 failed | M2 |
| `npx tsc --noEmit` | exit 0, no output | M3 |
| `pnpm lint` | exit 0 — **0 errors**, 25 warnings (all pre-existing, all in `scripts/author/*.mjs`) | M3 |
| `pnpm test` (vitest) | **102 passed**, 8 files, 0 failed | M3 |
| `pnpm build` | `✓ Compiled successfully in 12.0s` | M3 |
| `npx playwright test` | **19 passed**, 0 failed, 28.6s | M3 |

## Known broken

Nothing known broken.

## Bugs M3 found in earlier work

Two of these were shipped by M1/M2 and only surfaced when the production
build was rerun; both now have a structural test that fails on the exact
regression (each verified non-vacuous by planting the bug and watching the
rule fire).

- **`lib/i18n/index.ts` imported `next/headers`.** The catalogs and the
  translator cross into client components, so `pnpm build` failed with
  "You're importing a component that needs next/headers". Request-scoped
  resolution moved to `lib/i18n/server.ts`; `lib/i18n/index.ts` is now
  free of server-only imports. Guarded by *keeps next/headers out of every
  module a client component imports*, which walks the import graph from
  every `"use client"` file and stops at `"use server"` RPC boundaries.
- **`authMessage()` was exported from a `"use client"` module and called by
  a server component.** `tsc` and `next build` both accept this; it fails
  at request time with "Attempted to call authMessage() from the server".
  It moved to `lib/auth/messages.ts`. Guarded by *never calls a function
  exported from a client module on the server*.
- **The E2E suite was green against a stale build.** `pnpm start` serves
  whatever `.next` holds, so the first M3 Playwright run exercised M2's
  bundle and passed while the current code could not even compile. The
  gate now always runs `pnpm build` before `npx playwright test`.

## Unverified — needs the owner

**A Stripe test-mode purchase has not been run.** The environment has no
`STRIPE_SECRET_KEY`, so no Checkout Session has ever been created against
Stripe, and no webhook has ever been received from Stripe. What *is*
verified is the handler that receives them, against fixtures built to the
real event shapes (`tests/helpers/stripe-events.ts`), and the paywall in a
browser. The seven-step procedure to close the gap is in
`docs/BILLING.md`; it takes about twenty minutes with test keys.

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
  - `billing.test.ts` (M2) — pricing and VAT arithmetic, entitlement
    transitions, and the two webhook hazards: replay and out-of-order
    delivery.
  - `paywall-structure.test.ts` (M2) — every page gates or is listed as
    public/mixed on purpose; every API route authenticates; every server
    action gates unless deliberately free; and no price literal exists
    outside `lib/billing/pricing.ts`.
  - `bootstrap-upgrade.test.ts` (M2) — a `db:push` database from before
    accounts existed, booted by today's code: it adopts a migration
    ledger, catches up, and keeps its history.
  - `i18n.test.ts` (M3) — catalog completeness in both locales, sv-SE
    `Intl` output, Accept-Language parsing, every taxonomy value labelled,
    GMAT terminology left in English inside the Swedish catalog, every
    question stem in the bank still English, and the two module-boundary
    rules above.
- **Playwright** (`npx playwright test`) — end-to-end against a production
  build. Chromium is resolved from `PLAYWRIGHT_BROWSERS_PATH`; nothing is
  downloaded. `language.spec.ts` (M3) covers the toggle: a new account
  starts Swedish, the choice persists across navigation and a fresh
  sign-in, and a chapter's prose translates while its worked example stays
  in the exam's English.

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

## Decisions taken during M2 that change the product

- **The free tier is generous where it builds trust and closed where the
  value is.** Free: all 24 chapters, the pattern trainer, the diagnostic,
  and 10 questions a day. Paid: timed sets and section simulation, the
  redo queue, the takeaway deck, analytics, mastery ladders, decision
  drills, the daily plan, the whiteboard coach, and score-report import.
- **Swish is offered on the sprint plan only.** It cannot be used for a
  recurring charge, so putting it on the monthly plan would be a broken
  button. It also stays off entirely unless `STRIPE_ENABLE_SWISH=1`,
  because an account without it would fail the whole checkout session.
- **A failed payment does not cut access immediately.** Stripe retries for
  days; `past_due` keeps the plan and raises a visible warning instead.
- **A cancellation keeps access to the end of the paid period**, which is
  what the customer paid for.
- **The bootstrap now applies pending migrations to existing databases.**
  It previously only ever migrated an empty one, which meant M2's tables
  would never have reached a running deployment. Databases with no ledger
  adopt one once and then follow the normal path.

## Decisions taken during M3 that change the product

- **Swedish is unconditional for anyone who has not chosen otherwise, and
  `Accept-Language` is not consulted at all.** ADR 0004 originally ended
  the chain with the header; implementing it showed the header is the
  wrong signal here, because a large share of Swedish users run an
  English-language browser and would have been served an English site.
  Resolution is now account → `q86_locale` cookie → sv. Two consequences
  are implemented alongside it: the language toggle appears on the
  credential screens (not only in the signed-in header), so an English
  reader can switch before signing up; and `signUpAction` passes the
  resolved locale to `createUser`, so an account is created in the
  language its signup form was read in. ADR 0004 carries the revision.
- **The chapter files moved under a locale directory.** `content/lessons/`
  is now `content/lessons/en/` and `content/lessons/sv/`, and a missing
  Swedish chapter falls back to English with a banner saying so. No parser
  change was needed: the `##` headings and `**Example n**` markers are
  structural, and the displayed section titles come from the catalog, so a
  Swedish chapter keeps the English scaffolding verbatim.
- **The exam-fidelity boundary is a tested rule, not a convention.**
  Question stems, answer choices and Data Sufficiency statements stay in
  English; the interface, lesson prose, solution commentary, coaching and
  error-taxonomy labels are Swedish. The language toggle says so in its
  own tooltip rather than leaving it to be discovered.
- **No locale segment in the URL.** The app is served from unprefixed
  paths and the public site will be Swedish at the root, because the
  search intent Q86 targets is Swedish (ADR 0004).

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

- **Stripe:** a Swedish Stripe account and, in test mode first, a
  `STRIPE_SECRET_KEY`, a `STRIPE_WEBHOOK_SECRET`, and the two price ids
  (`STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_SPRINT`); Stripe Tax activated;
  Klarna enabled, and `STRIPE_ENABLE_SWISH=1` only if the account offers
  Swish. Then the live equivalents, plus the business details Stripe
  requires: organisationsnummer, VAT number, registered address, bank
  account. The seven-step verification is `docs/BILLING.md`.
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
