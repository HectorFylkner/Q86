# Deploying Q86 as a private website

Q86 is local-first: an embedded SQLite database and scratch-photo uploads
live on disk under `./data`. That rules out serverless hosts — **Vercel,
Netlify, and Cloudflare Pages will not work** without rearchitecting the
data layer (their functions have no persistent disk). What works, with
zero code changes, is any host that runs a container with a persistent
volume. The repo ships a `Dockerfile`, a self-provisioning entrypoint,
and a `fly.toml` for the recommended path below.

When `SITE_PASSWORD` is set, every page and API route is gated behind a
login screen (90-day cookie). Without it the app assumes it is local and
stays open — **never expose an instance publicly without setting it.**

## Fly.io (recommended)

Costs roughly $2–4/month at this footprint; the machine auto-stops when
idle and restarts on the next request in about a second. Requires a
credit card on the Fly account.

1. Install the CLI and sign up: <https://fly.io/docs/flyctl/install/>

   ```sh
   fly auth signup
   ```

2. From the repo root, create the app and volume (pick your own app
   name; `arn` = Stockholm, choose a region near you):

   ```sh
   fly launch --no-deploy --copy-config --name <your-app-name>
   fly volumes create q86_data --size 1 --region arn
   ```

3. Set the secrets. `SITE_PASSWORD` is required; the Anthropic pair is
   optional (AI features only):

   ```sh
   fly secrets set SITE_PASSWORD=<a-long-password>
   fly secrets set ANTHROPIC_API_KEY=<sk-ant-...> ANTHROPIC_MODEL=claude-sonnet-5
   ```

4. Deploy:

   ```sh
   fly deploy
   ```

   The entrypoint applies the schema and loads the 180-question bank on
   first boot (`180 inserted … 180 verified`). Your site is at
   `https://<your-app-name>.fly.dev` — log in with the site password.

Redeploying after a `git pull` is just `fly deploy` again; the volume
(your attempt history) is untouched, and the seed loader only refreshes
question content.

### Backups

Your training history lives only on that volume. Fly snapshots volumes
daily (5-day retention), and you can pull a copy anytime:

```sh
fly ssh console -C "pnpm backup"
fly ssh sftp get /app/backups/<printed-directory>/q86.db ./q86-backup.db
```

## Railway / Render / a VPS

The same `Dockerfile` works anywhere that offers a persistent disk:
mount it at `/app/data`, set `SITE_PASSWORD` (plus the optional
Anthropic vars), and point the platform at the Dockerfile. On Railway
add a volume in the service settings; on Render use a paid instance
with a disk (the free tier has none).

## Why not Vercel + Supabase?

Moving to Vercel would mean swapping better-sqlite3 for a hosted
database (Turso/Supabase), converting the entire synchronous data layer
to async drivers, and relocating scratch-photo storage to an object
store — a large, regression-prone rewrite for no training benefit. If
you ever genuinely need serverless, treat it as its own project.
