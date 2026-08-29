# Deploying Q86

Two supported ways. **Vercel + Turso** is the documented path and needs no
terminal. **Docker on a host with a disk** (Fly.io, Railway, a VPS) is the
alternative and keeps everything in one SQLite file on a volume.

Whichever you pick, the app provisions itself on first boot: the Next.js
instrumentation hook applies pending migrations through drizzle's ledger
and loads the 360-question bank. Both steps are idempotent, so redeploys
and restarts are safe and an existing database is migrated, never
recreated.

> **Do not run `pnpm db:push` against a deployment.** It creates today's
> tables without a migration ledger. The boot path now detects that and
> recovers, but the supported route is migrations, and `db:push` is for a
> throwaway local database only.

---

## Before you deploy anything

`docs/marketing/launch-checklist.md` is the ordered list, and several
items there gate a *public* launch rather than a deploy. The minimum for a
deploy that works at all:

- A database (Turso, or a volume).
- `NEXT_PUBLIC_SITE_URL` set to the URL it will actually be served from.
  Password-reset links, referral links, canonical tags, the sitemap and
  the Open Graph URLs all resolve against it; unset, they point at
  `http://localhost:3000`.

Everything else degrades honestly: without Stripe the pricing page says
payments are not configured, without a mail key messages are logged
instead of sent, without an Anthropic key the three AI endpoints answer
500 and the rest of the product works.

---

## Path A — Vercel + Turso (no terminal)

### 1. Turso (the database)

1. <https://app.turso.tech>, sign up with GitHub.
2. Create a database named `q86`, region closest to your users
   (Stockholm = `arn`).
3. Copy the **URL** (`libsql://…`) and a **token** ("Create token").

### 2. Vercel (the site)

1. <https://vercel.com/new>, sign up with GitHub so it can see the repo.
2. Import **Q86**. It is detected as a Next.js app; change nothing.
3. Before pressing Deploy, add the environment variables below.
4. Deploy.

### 3. Environment variables

**Required**

| Name | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | the `libsql://…` URL |
| `TURSO_AUTH_TOKEN` | the token |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app`, or your domain |

**Payments** — without these the pricing page says so, in Swedish

| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_…` first; `sk_live_…` only after `docs/BILLING.md` has been run end to end |
| `STRIPE_WEBHOOK_SECRET` | from the Stripe webhook you point at `<your URL>/api/billing/webhook` |
| `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_SPRINT` | the two price ids |
| `STRIPE_ENABLE_SWISH` | `1` only if your Stripe account offers Swish |

**Mail** — without these every lifecycle message is written to the log

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | from Resend |
| `EMAIL_FROM` | a verified sender on your sending domain. Required once the key is set; sending refuses without it rather than sending from an address nobody controls |

**Optional**

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | the address the legal pages tell people to write to |
| `ANTHROPIC_API_KEY` | the coach, report import and question generation |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in; register `<your URL>/api/auth/google/callback` as the redirect URI |
| `SENTRY_DSN` | error reporting; without it errors go to the log |
| `AI_USER_MONTHLY_CAP_ORE` | per-account AI cap, default `5000` (50 kr) |
| `AI_GLOBAL_MONTHLY_CAP_ORE` | whole-service AI cap, default `200000` (2 000 kr) |

### 4. After the first deploy

1. Open the site and create an account at `/signup`. The first page load
   takes a few extra seconds while the bank is installed — once only.
2. Make yourself an admin, then open `/admin` to see which of the
   variables above actually took effect:

       turso db shell q86 "update users set role='admin' where email='you@example.com'"

3. Schedule the lifecycle mail. On Vercel, a cron in `vercel.json`
   pointing at a route, or an external scheduler running
   `pnpm email:lifecycle` hourly. It is safe to run more often — every
   message claims its window by primary key before it sends.
4. If the database already held history from before accounts existed,
   claim it rather than signing up fresh:

       pnpm claim-owner --email=you@example.com --password='…'

---

## Path B — Docker on a host with a disk

Fly.io, Railway, or any VPS. The app runs in file mode against a volume
mounted at `/app/data`; no Turso involved. Scratch images live inside the
database, so that one file is the whole thing.

    fly launch --no-deploy          # reads fly.toml
    fly volumes create q86_data --size 1 --region arn
    fly secrets set NEXT_PUBLIC_SITE_URL=https://<app>.fly.dev
    fly deploy

`fly.toml` sets `auto_stop_machines`, so an idle instance costs nothing
and the first request after a pause takes a second longer.

Set the same secrets as the Vercel table above with `fly secrets set`.

### Backups on a volume

Turso keeps its own point-in-time backups; a volume does not.

    fly ssh console -C "pnpm backup"     # → backups/q86-<timestamp>/q86.db

and pull it down. `pnpm restore <file>` puts one back, and refuses to be
careless about it — see `docs/OPERATIONS.md`.

---

## What deploys automatically

Nothing, until you connect it. Vercel deploys on push to the branch you
choose when importing. `.github/workflows/ci.yml` runs lint, typecheck,
tests, the bank verifier and Playwright on every push, but it does not
deploy — a green CI run is a precondition for deploying, not the deploy
itself.

---

## Things that will bite you

- **`NEXT_PUBLIC_SITE_URL` unset.** Reset emails send people to
  localhost. This is the single most common broken deploy.
- **A Stripe webhook pointed at the wrong path.** It is
  `/api/billing/webhook`, and it authenticates by signature, not by
  session.
- **`EMAIL_FROM` on an unverified domain.** Resend accepts the key and
  rejects the message.
- **Running `pnpm db:push` against production.** See the warning at the
  top.
- **Forgetting the AI caps.** The defaults are deliberately low. Raise
  them on purpose, not by discovering a refusal.
