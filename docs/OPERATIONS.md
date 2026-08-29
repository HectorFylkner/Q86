# Operations

What to do when something needs doing. Every command here has been run in
this repository; where a step needs credentials this environment does not
have, that is said plainly rather than glossed over.

---

## Environment variables

| Variable | Needed for | Without it |
|---|---|---|
| `TURSO_DATABASE_URL` | Hosted database | Falls back to `./data/q86.db` |
| `TURSO_AUTH_TOKEN` | Hosted database | — |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, reset links, referral links, sitemap | Links point at `http://localhost:3000` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Contact address on legal pages | Defaults to `hej@q86.se` |
| `ANTHROPIC_API_KEY` | Coach, report parsing, generation | Those three endpoints answer 500 |
| `ANTHROPIC_MODEL` | Model override | `claude-sonnet-4-6` |
| `STRIPE_SECRET_KEY` | Checkout and the portal | Pricing shows "payments not configured" |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature check | Webhook rejects everything |
| `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_SPRINT` | Checkout | Those plans cannot be bought |
| `STRIPE_ENABLE_SWISH` | Swish on the sprint plan | Card and Klarna only |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in | The button does not render |
| `RESEND_API_KEY` | Sending mail | Messages are logged, not sent |
| `EMAIL_FROM` | Sending mail | Required once `RESEND_API_KEY` is set; sending refuses without it |
| `SENTRY_DSN` | Error reporting | Errors go to the log |
| `AI_USER_MONTHLY_CAP_ORE` | Per-account AI cap | 5 000 öre (50 kr) |
| `AI_GLOBAL_MONTHLY_CAP_ORE` | Whole-service AI cap | 200 000 öre (2 000 kr) |

The admin page at `/admin` shows which of these are actually set, so the
first move on any "why isn't X working" is to look there.

---

## Backup

    pnpm backup                  # → backups/q86-<timestamp>/q86.db
    pnpm backup /some/other/dir

Uses SQLite's `VACUUM INTO`, so the copy is consistent while the app is
serving. Scratch images live inside the database, so the single file is the
complete backup. Nothing is ever deleted.

**With `TURSO_DATABASE_URL` set the script does nothing and says so** —
the data lives in Turso, which keeps its own point-in-time backups.

### What to back up on Turso

Turso's own retention is the backup. Confirm the window on your plan and,
if it is shorter than you are comfortable with, take a periodic dump:

    turso db shell <name> ".dump" > q86-$(date +%F).sql

---

## Restore

    pnpm restore backups/q86-2026-08-29T12-00-00/q86.db
    pnpm restore <file> --force

The script refuses to do anything dangerous quietly:

1. It runs `pragma integrity_check` on the backup **before** touching the
   live file, and stops if it fails.
2. It refuses a file with no tables. An empty file is a valid SQLite
   database and passes `integrity_check`, so integrity alone is not
   enough — that gap was found by testing the script rather than reading
   it.
3. It prints the account, attempt and question counts it found, so you can
   see whether you grabbed the right snapshot before you commit to it.
4. Without `--force` it refuses when `data/q86.db` already exists. With
   `--force` it *moves the existing file aside* (`q86.db.replaced-<ts>`)
   rather than deleting it.
5. With `TURSO_DATABASE_URL` set it refuses outright and tells you to use
   `turso db restore`, because copying a local file over a hosted database
   leaves the two disagreeing.

After a restore, start the app once: the bootstrap applies any pending
migrations and reloads the seed bank if it is short.

### Verified

Run against a real 864 kB database in this session: reported
`21 table(s)`, `users: 22`, `attempts: 4`, `questions: 360`; refused the
second run without `--force`; moved the old file aside on the third.

---

## The AI cost caps

Three endpoints spend money: `/api/generate`, `/api/coach`,
`/api/parse-report`. Each call is metered into `api_usage` with the
provider's own token counts and the cost those imply.

Four limits, checked in this order:

1. **Calls per hour**, per account per route.
2. **Calls per day**, per account per route.
3. **Monthly cost, per account** — `AI_USER_MONTHLY_CAP_ORE`.
4. **Monthly cost, whole service** — `AI_GLOBAL_MONTHLY_CAP_ORE`.

A refusal is a `429` with a machine-readable `reason`, which the interface
turns into a sentence in the reader's own language.

**When the global cap trips**, every account is refused until the month
turns or you raise the variable. That is deliberate and it is the correct
behaviour for a bill that is running away — but it means the variable is
the emergency brake, and `/admin` is where you see it coming.

Raising a cap takes effect immediately; nothing is cached.

---

## Lifecycle email

    pnpm email:lifecycle

Run it hourly. It is safe to run more often and safe to re-run after a
crash: every message claims `<userId>:<kind>:<window>` in `email_log`
**before** it sends, so idempotency is a primary key rather than a query.

With no `RESEND_API_KEY` it prints the messages instead of sending them,
and says so on the first line. That is how every environment in this
repository behaves.

There is deliberately no `--dry-run`: a preview would have to claim the
window, which would suppress the real message. The unit tests
(`tests/unit/retention.test.ts`) assert the same decisions.

---

## Error reporting

Set `SENTRY_DSN` and errors are posted as Sentry envelopes over `fetch` —
no SDK, no automatic instrumentation, no source maps. Without it they go
to the log. Reports carry an account id at most, never an email address or
a name.

---

## Analytics

`page_views` counts paths per day, server-side, with **no identifier of any
kind**: no account id, no session, no IP, no hash of an IP. Nothing is read
from or written to the visitor's device, which is why the count keeps
working when someone declines the cookie banner and why it needs no
consent. This is stated in the privacy policy rather than assumed.

The trade-off is real: it cannot distinguish a returning visitor, and it
cannot follow anyone through a funnel. If you later want that, it needs a
consent-gated tool — the banner already exposes `q86-consent-analytics` in
`localStorage` and dispatches a `q86-consent` event for a loader to listen
to.

---

## Question-flag triage

`/admin` lists every open flag across every account, because a flag is a
report about the shared bank and retiring a question affects everyone.
Resolving is admin-only, in code and not merely in the interface.

Retiring sets `verified = false`; rows are never deleted, so a retirement
is reversible and the history stays.

---

## Adding an admin

There is no interface for it, on purpose. Promote directly:

    sqlite3 data/q86.db "update users set role='admin' where email='…'"

or, on Turso:

    turso db shell <name> "update users set role='admin' where email='…'"

---

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

- **check** — lint, typecheck, unit and integration tests, production build
- **bank** — `scripts/verify-bank.ts`, so a change that lets an unverified
  question into the bank fails in CI rather than in review
- **e2e** — Playwright against a real production build, with the report
  uploaded on failure

Both AI and payment credentials are absent in CI by construction, so
nothing there can reach a paid API or a real charge.
