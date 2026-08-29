#!/bin/sh
# Boot-time provisioning for a container with a mounted volume.
#
# There is deliberately nothing here but `start`. The Next.js
# instrumentation hook calls `ensureDbReady()` on every server boot, which
# applies pending migrations through drizzle's ledger and loads the seed
# bank if it is short — both idempotent, so restarts and redeploys are
# safe and the SQLite file on the volume is migrated, never recreated.
#
# This script used to run `pnpm db:push` first. That was correct when the
# schema was whatever schema.ts said and there were no migrations; it
# became a crash on first boot once migrations existed, because db:push
# creates the current tables without stamping the ledger, and the boot
# path then replays 0002 against tables that already exist:
#
#   Q86 bootstrap: adopted the migration ledger for a db:push database.
#   BOOT FAILED: SQLITE_ERROR: table `users` already exists
#
# Verified by reproducing it, so it is not a guess.
set -e

exec pnpm start
