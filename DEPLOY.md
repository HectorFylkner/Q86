# Deploying Q86 as a private website

Q86 runs on libSQL: locally that's a plain SQLite file under `./data`
(no accounts, no cloud), and in production the same code talks to a
hosted [Turso](https://turso.tech) database. Scratch-work photos live
inside the database, so nothing depends on server disk — which is what
makes serverless hosting work.

When `SITE_PASSWORD` is set, every page and API route is gated behind a
login screen (90-day cookie). Without it the app assumes it is local and
stays open — **never expose an instance publicly without setting it.**

## Vercel + Turso (recommended — free)

Both free tiers comfortably fit a single-user training app, and every
`git push` deploys automatically.

1. **Create the database** (Turso CLI: <https://docs.turso.tech/cli>):

   ```sh
   turso auth signup
   turso db create q86 --location arn
   turso db show q86 --url
   turso db tokens create q86
   ```

   Keep the URL (`libsql://…`) and the token.

2. **Provision it from your machine** — applies the schema and loads
   the 180-question bank into Turso:

   ```sh
   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… pnpm db:push
   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… pnpm seed
   ```

   Expect `180 inserted … 180 verified seed questions total`.

3. **Create the Vercel project**: <https://vercel.com/new>, import the
   GitHub repo (framework auto-detects as Next.js — no settings to
   change). Before the first deploy, add the environment variables:

   | Variable | Value |
   | --- | --- |
   | `TURSO_DATABASE_URL` | the `libsql://…` URL |
   | `TURSO_AUTH_TOKEN` | the token |
   | `SITE_PASSWORD` | a long password — required |
   | `ANTHROPIC_API_KEY` | optional, AI features only |
   | `ANTHROPIC_MODEL` | optional, e.g. `claude-sonnet-5` |

4. **Deploy.** Your site is at `https://<project>.vercel.app` — log in
   with the site password. Future updates ship on `git push` (or by
   pressing Redeploy in the dashboard).

Tips:

- In the Vercel project settings, set the function region near your
  Turso location (e.g. `arn1`/`fra1` for a Stockholm database) so
  queries stay low-latency.
- Turso keeps point-in-time backups on its side; `turso db shell q86`
  gives you raw SQL access. Local `pnpm backup` is for file mode only.
- Your laptop's local `./data/q86.db` and the Turso database are
  separate worlds by design — train against one. If you want your local
  history in the cloud, upload the file once:
  `turso db shell q86 < <(sqlite3 data/q86.db .dump)` before step 2, or
  just start fresh in the cloud.

## Any Docker host with a disk (alternative)

The repo also ships a `Dockerfile`, self-provisioning entrypoint, and
`fly.toml`. On Fly.io/Railway/a VPS the app runs in file mode against a
volume mounted at `/app/data` — no Turso involved. Set `SITE_PASSWORD`
(plus the optional Anthropic vars) and deploy; the entrypoint applies
the schema and seed bank on every boot.
