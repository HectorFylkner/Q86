# Q86 commercial build — progress ledger

The working record across context windows. Read this, `docs/adr/`, and
`git log` before doing anything else.

**Branch:** `claude/q86-platform-overview-i29beu`
**Rule:** a claim in the "verified" column names a command that was run in
this repository and printed the result claimed. Anything else is labelled
unverified.

---

## Current milestone

**M7 — Marketing kit.** Complete, and nothing has been posted anywhere.
`docs/marketing/` holds the positioning, the messaging rules with the
basis for every claim, a launch checklist in dependency order, and drafts
for five channels. Ten rules in `tests/unit/marketing.test.ts` enforce the
honesty constraints in CI rather than leaving them in a README.

**All seven milestones are done.** What remains is the list under "What
the owner still has to supply", which is entirely credentials, a domain,
a lawyer's read of the legal pages and an accountant's read of the moms
assumption.

### Previously

**M6 — Operations.** Complete. Every call to the three endpoints that
spend money is metered with the provider's own token counts and refused
at four thresholds; `/admin` shows what the deployment is configured to
do, what it has cost this month, every account's state and the open
question flags; errors report through one dependency-free seam; page
counting is cookieless and therefore unaffected by the banner; backup has
a matching restore with real guards; and CI runs lint, typecheck, tests,
the bank verifier and Playwright on every push.

### Previously

**M5 — Retention.** Complete. Onboarding takes a test date and a
timed-set cadence and shows the first week the real planner produces.
Four Swedish lifecycle messages (welcome, access ending, streak recovery,
weekly progress) go out through a dispatcher whose idempotency is a
primary key. A progress card is shareable behind a rotatable token and
carries no identifying data. Referral codes grant 14 days to both sides
through `access_grants`, read by the same entitlement function as a
purchase.

Nothing in this build sends live mail: with no `RESEND_API_KEY` every
message is written to the log instead, which is how the tests observe it.

### Previously

**M4 — Public site and acquisition funnel.** Complete. The application
moved out of the root: `/` is now the Swedish landing page and the
dashboard lives at `/idag`. The public surface is the landing page,
`/priser`, the free diagnostic at `/diagnos`, four guides under `/guider`,
and the three legal pages. SEO, a sitemap, a robots file, a rendered Open
Graph card and article structured data are in place, and cookie consent
gates any non-essential script before it loads.

### Previously

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
| M4 | Public site and acquisition funnel | ✅ done | see git log |
| M5 | Retention | ✅ done | see git log |
| M6 | Operations | ✅ done | see git log |
| M7 | Marketing kit | ✅ done | see git log |

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
| `npx tsc --noEmit` | exit 0, no output | M4 |
| `pnpm lint` | exit 0 — **0 errors**, 25 warnings (all pre-existing, all in `scripts/author/*.mjs`) | M4 |
| `pnpm test` (vitest) | **118 passed**, 9 files, 0 failed | M4 |
| `pnpm build` | `✓ Compiled successfully in 18.7s`; 4 guide pages prerendered, sitemap/robots/OG card static | M4 |
| `npx playwright test` | **27 passed**, 0 failed, 37.6s | M4 |
| `npx tsc --noEmit` | exit 0, no output | M5 |
| `pnpm lint` | exit 0 — **0 errors**, 25 warnings (all pre-existing) | M5 |
| `pnpm test` (vitest) | **141 passed**, 11 files, 0 failed | M5 |
| `pnpm build` | `✓ Compiled successfully in 13.4s` | M5 |
| `npx playwright test` | **31 passed**, 0 failed, 45.8s | M5 |
| `npx tsc --noEmit` | exit 0, no output | M6 |
| `pnpm lint` | exit 0 — **0 errors**, 25 warnings (all pre-existing) | M6 |
| `pnpm test` (vitest) | **158 passed**, 12 files, 0 failed | M6 |
| `pnpm build` | `✓ Compiled successfully in 13.8s` | M6 |
| `npx playwright test` | **35 passed**, 0 failed, 47.8s | M6 |
| `pnpm verify-bank` | `360 questions`, `All bank questions pass mechanical verification`, exit 0 | M6 |
| `pnpm restore <864 kB backup>` | `21 table(s)`, `users: 22`, `attempts: 4`, `questions: 360`; refused a second run without `--force`; moved the old file aside with it | M6 |
| `npx tsc --noEmit` | exit 0, no output | M7 |
| `pnpm lint` | exit 0 — **0 errors**, 25 warnings (all pre-existing) | M7 |
| `pnpm test` (vitest) | **168 passed**, 13 files, 0 failed | M7 |
| `pnpm build` | `✓ Compiled successfully in 13.2s` | M7 |
| `npx playwright test` | **35 passed**, 0 failed, 47.1s | M7 |
| `npx drizzle-kit generate --name retention` | produced an additive 0004 (4 nullable columns, 2 tables); kept as generated | M5 |

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
  - `marketing.test.ts` (M7) — the ten honesty rules over
    `docs/marketing/`, including that the README still says nothing has
    been posted and that no draft quotes a price the pricing module does
    not hold.
  - `ops.test.ts` (M6) — cost arithmetic rounds up so a cap cannot
    under-count; rate limits are per account and per route; a failed call
    is still metered; the per-account and global caps both trip; last
    month does not count against this one; every route reaching
    `getModel()` both refuses and meters; the page counter covers the
    public site only and stores no identifying column.
  - `retention.test.ts` (M5) — referral codes mint once and resolve
    case-insensitively; a payout cannot happen twice or to oneself and
    stacks onto the end of an existing grant; a grant unlocks paid
    features through `resolveEntitlements` and stops the moment it
    expires; the progress card contains no identifying field and revoking
    breaks an already-shared link; the dispatcher welcomes once, digests
    once per ISO week, warns only about a window that will actually
    close, and mourns only a streak that existed.
  - `migration-retention.test.ts` (M5) — 0004 applied to a populated
    pre-M5 database: rows preserved, new columns null, new tables empty,
    two accounts able to share a null code, no FK violations.
  - `diagnostic.test.ts` (M4) — the diagnostic set is balanced, stable
    and stripped of the answer key; the band is an interval; the weakest
    skill is named from the answers; the plan preview is seven days from
    the real planner and weights toward the weakest skill. Plus two
    content rules: no score guarantee anywhere on the public site, and
    the GMAC disclaimer present in the shared footer copy.
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

## Decisions taken during M4 that change the product

- **The application moved off the root.** `/` is the public landing page
  and the dashboard is `/idag`. A crawler and a stranger now always see
  the marketing page at the root instead of a redirect to a login form,
  which is the whole point of the SEO work. `AFTER_SIGN_IN` and every
  in-app "back to today" link moved with it; signing out goes to `/login`
  rather than the landing page, because someone signing out on a shared
  machine wants the door shut, not a sales pitch.
- **Route groups replaced one shared shell.** `app/(app)/` carries the
  signed-in chrome, `app/(marketing)/` the public chrome, `app/(auth)/`
  the bare ground. The root layout is now only the ground, the fonts and
  the providers — a landing page needs full-bleed sections and the app
  needs a fixed measure, and one layout could not do both.
- **The diagnostic writes nothing and needs no account.** Twelve
  questions, three per fundamental skill, chosen by a stable rule so two
  readers can compare notes. Correct answers never reach the browser:
  scoring is a server action that re-reads the key from the bank, which
  also means the endpoint cannot be used to dump it. An E2E test asserts
  `correctIndex`, `solutionMd` and `trapMap` are absent from the page.
- **The plan preview is the real planner.** `previewWeek()` calls the
  product's own `computeDailyPlan` with the diagnostic as its only input,
  rather than sketching a plausible-looking week. A preview that did not
  match what the account would actually get would be a lie told at the
  moment of sign-up.
- **The reported band is an interval, deliberately wide.** Difficulty-
  weighted accuracy mapped linearly onto 60–90, ±3, with the caveat shown
  next to the number. Twelve questions do not support a point estimate,
  and claiming they do is exactly what marknadsföringslagen exists to
  stop.
- **A second Markdown renderer, not a change to the first.**
  `components/site/article.tsx` handles tables, rules and links for the
  guides and legal pages. `components/math.tsx` renders question stems and
  lesson chapters and was left alone: this milestone had no business
  touching the exam-critical path to gain a table.
- **Consent gates the script, it does not hide it.** No analytics script
  is inserted until consent is `granted`; refusing is one click at the same
  visual weight as accepting; the choice lives in `localStorage` rather
  than in a cookie, and the footer can reopen the dialog. M6 will read
  `q86-consent-analytics` before loading anything.
- **The legal pages are content files, not components.** They live in
  `content/legal/sv/` so the owner's lawyer can read and edit them without
  opening a `.tsx` file. The company details are a stated placeholder
  rather than an invented company.

## Decisions taken during M5 that change the product

- **Signup now lands on onboarding, not the dashboard.** `/valkommen` asks
  two questions — a test date and a timed-set cadence — and then shows the
  week those answers produce, computed by the same `computeDailyPlan` the
  dashboard runs. It can be skipped in one click.
- **Access can come from a grant as well as a purchase.**
  `access_grants` is additive and is never written by Stripe, so a webhook
  cannot wipe a referral reward and a grant cannot be mistaken for a
  payment. `resolveEntitlements` returns `grantedUntil` beside `paid`, and
  a purchase outranks a grant when both are live.
- **A referral pays 14 days to each side, once, enforced by an index.**
  The unique key is `(user_id, reason, source_user_id)`, so a retry or a
  double submit cannot pay twice; self-referral is refused. Codes and
  share tokens are minted on first request rather than at signup.
- **Lifecycle mail claims its window before it sends.** Every message
  writes `<userId>:<kind>:<window>` into `email_log` first, so the
  dispatcher is safe to run hourly, twice, or replayed. Losing a message
  to a delivery failure after the claim is the deliberate trade: a missing
  weekly digest is invisible, a duplicate is not.
- **The progress card publishes totals and nothing else.** Streak,
  question count, accuracy, chapters passed. No email, no name, no
  question, no answer, and the weakest subtopic is deliberately left off
  because the card gets shared into group chats. Revoking rotates the
  token and breaks every link already posted; card pages are `noindex`.
- **`REFERRAL_DAYS` lives in `lib/retention/terms.ts`**, a module with no
  imports, because the signup form needs the number and `grants.ts`
  reaches `node:crypto` and the database.

## Decisions taken during M6 that change the product

- **The three AI endpoints now refuse before they spend.** Four
  thresholds in order: calls per hour, calls per day, monthly cost per
  account (default 50 kr), monthly cost across the whole service (default
  2 000 kr). A refusal is a `429` with a machine-readable reason that the
  interface turns into a sentence in the reader's language.
- **A failed call is metered too**, because it reached the provider and
  was billed. A meter that counted only successes would under-report
  exactly when something is going wrong.
- **`PipelineResult` gained a `usage` field** so `/api/generate` meters
  honestly rather than estimating. Additive — nothing in the authoring
  gate reads it — but it is a change to the exam-critical path and is
  called out in ADR 0007 for that reason.
- **Page counting stores no identifier at all.** No account id, no
  session, no IP, no hash of an IP; nothing read from or written to the
  visitor's device. That is why it needs no consent and keeps working
  when someone declines the banner, and it is stated in the privacy
  policy rather than assumed. The cost is real: it cannot tell a
  returning visitor from a new one.
- **`/admin` is gated by role, not by plan.** `requireFeature` is the
  wrong check for an operator surface; the structural test now has an
  explicit admin list so "no requireFeature" cannot smuggle an ungated
  page past it.
- **`pnpm restore` exists and refuses to be careless**: it verifies the
  backup before touching the live file, rejects a file with no tables (an
  empty file passes `integrity_check`, which the script's own testing
  exposed), prints the counts it found, and moves the existing database
  aside rather than deleting it.

## Decisions taken during M7 that change the product

- **Nothing was posted.** No account was created on any platform, no
  message was sent, and no listing was bought. `docs/marketing/` is
  drafts for a person to edit and post themselves.
- **The honesty constraints are tested, not documented.**
  `tests/unit/marketing.test.ts` fails on a score guarantee, an invented
  user count, a fabricated testimonial, an implied GMAC association, a
  channel draft with no authorship disclosure, a link placeholder in a
  block that does not say who wrote it, and a price that disagrees with
  `lib/billing/pricing.ts`. Each verified by planting exactly what it
  forbids.
- **A paid listing is the one exemption from the disclosure rule**, and
  it is named in the test with its reason: a directory entry is
  understood to be advertising, so there is nothing being passed off as a
  neutral recommendation.
- **Two real omissions in the copy were found by those rules** — the
  Flashback draft carried no trademark line, and the rule that accepted
  "Admin har godkänt" as a disclosure was wrong, because permission from
  a moderator is not a statement of authorship.

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
- **An email-sending domain** with SPF, DKIM and DMARC, plus a Resend
  account: `RESEND_API_KEY` and `EMAIL_FROM` (a verified sender on that
  domain). Until both are set, every lifecycle message is written to the
  log instead of delivered — no build in this repository has ever sent
  mail. `lib/email/transport.ts` is the only file that would change for a
  different provider.
- **A Sentry DSN** (`SENTRY_DSN`) if errors should go anywhere but the
  log. Without it nothing leaves the machine.
- **A decision on the AI caps.** `AI_USER_MONTHLY_CAP_ORE` (50 kr) and
  `AI_GLOBAL_MONTHLY_CAP_ORE` (2 000 kr) are defaults chosen to be
  generous for a real user and ruinous for a script; they are the
  emergency brake and should be set deliberately before launch.
- **A scheduler for `pnpm email:lifecycle`**, once an hour. It is safe to
  run more often; every send is claimed by a primary key first.
- **A human review of the legal pages** (integritetspolicy, köpvillkor,
  ångerrätt) before launch. They are written to be correct and specific,
  not to substitute for advice, and they live as Markdown in
  `content/legal/sv/` so a lawyer can edit them without touching code.
- **The company details behind Q86** — legal name, organisationsnummer,
  VAT number and postal address. All three legal pages currently carry an
  explicit placeholder saying the details will be filled in before launch;
  the placeholder is deliberate, because inventing a company would be
  worse than admitting the gap. `NEXT_PUBLIC_SUPPORT_EMAIL` sets the
  contact address (it defaults to `hej@q86.se`, which does not yet exist).
- **A static Space Grotesk cut at `app/fonts/space-grotesk-og.ttf`** if
  the Open Graph card should use the display face. The card renders today
  with the system stack, because Satori cannot parse the variable WOFF2
  the app itself uses; the code falls back rather than failing the build.
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
