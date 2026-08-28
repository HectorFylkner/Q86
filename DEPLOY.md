# Putting Q86 on the web (no terminal needed)

The app sets itself up on its first visit: it creates its database
tables and loads all 180 verified questions automatically. That means
deployment is entirely point-and-click in the browser — two free
accounts, roughly ten minutes.

You will create:

1. a **Turso** account — holds your database (question bank, attempt
   history, everything) in the cloud, free tier;
2. a **Vercel** account — serves the website itself, free tier.

## Step 1 — Turso (the database)

1. Go to <https://app.turso.tech> and sign up (easiest with your
   GitHub account).
2. Create a database: name it `q86`, pick the region closest to you
   (e.g. Stockholm).
3. On the database's page, copy two things into a note:
   - the **URL** — starts with `libsql://…`
   - a **token** — look for "Create token" / "Generate token" and copy
     the long string it gives you.

## Step 2 — Vercel (the website)

1. Go to <https://vercel.com/new> and sign up with your **GitHub**
   account, so Vercel can see your repositories.
2. Import the **Q86** repository. Vercel recognizes it as a Next.js
   app — change nothing.
3. Before pressing Deploy, open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | the `libsql://…` URL from step 1 |
   | `TURSO_AUTH_TOKEN` | the token from step 1 |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` — used in password-reset links |

   Optional: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to offer Google
   sign-in (register `<your URL>/api/auth/google/callback` as the redirect
   URI); `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` for the AI features
   (coach, twins, report import).

   There is no site-wide password any more. Q86 has real accounts: the
   first person to visit `/signup` creates one.

4. Press **Deploy** and wait a minute or two.

## Step 3 — use it

Open `https://<your-project>.vercel.app` and create an account at
`/signup`. The very first page load takes a few extra seconds while the
app installs its question bank into your Turso database — that happens
only once. Bookmark it on your phone; a session lasts 30 days per device
and slides forward while you keep training.

If your Turso database already held history from before accounts existed,
that history migrates into a single legacy owner account on first boot.
Claim it from a terminal with
`pnpm claim-owner --email=you@example.com --password='…'` (with
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` set) rather than signing up
fresh — a new signup would start from zero.

From now on, any update pushed to the repository's main branch deploys
itself automatically.

## Good to know

- **Backups**: Turso keeps its own point-in-time backups of your
  database.
- **Your laptop's copy is separate.** Running the app locally uses a
  local file database; the website uses Turso. Train on the website so
  all your statistics live in one place.
- **Region tip** (optional): in Vercel's project settings you can set
  the function region to match your Turso region (e.g. Stockholm =
  `arn1`) for snappier pages.

## Alternative: any Docker host with a disk

The repo also ships a `Dockerfile`, self-provisioning entrypoint, and
`fly.toml`. On Fly.io/Railway/a VPS the app runs in file mode against a
volume mounted at `/app/data` — no Turso involved. Set
`NEXT_PUBLIC_SITE_URL` and deploy.
