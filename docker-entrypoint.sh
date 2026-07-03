#!/bin/sh
# Boot-time provisioning: apply the schema and load the committed question
# bank. Both steps are idempotent, so restarts and redeploys are safe — the
# SQLite database on the mounted volume is never recreated, only migrated.
set -e

pnpm db:push
pnpm seed
exec pnpm start
