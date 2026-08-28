# ADR 0001 — Database engine and tenancy model

**Status:** Accepted · **Date:** 2026-08-28 · **Milestone:** M0, binding on M1

## Context

Q86 today is a single-user application. `lib/db/schema.ts` declares eleven
tables and not one of them carries an owner: `sessions`, `attempts`,
`edits`, `redo_queue`, `pattern_attempts`, `elo_ratings`,
`baseline_reports`, `settings`, `deck_reviews` and `question_flags` all
assume exactly one human owns every row. `questions` is different in kind —
it holds the 360-item verified bank, which is shared content, not user data.

The storage layer is Drizzle ORM over libSQL. `lib/db/index.ts` opens a
local SQLite file at `./data/q86.db` unless `TURSO_DATABASE_URL` is set, in
which case the identical code talks to Turso. `lib/db/bootstrap.ts` makes a
cold database self-provisioning: the first request applies the migrations
and loads the committed bank, so a deploy needs no terminal step.

Turning this into a subscription product means many owners share one
database. The question that constrains everything downstream is whether we
add a tenant column to the existing engine or move to Postgres, where
row-level security can enforce isolation in the database itself rather than
in application code.

## Decision

**Stay on libSQL/SQLite via Drizzle. Add a `user_id` column to every
user-owned table. Enforce isolation at a single application-level choke
point — a scoped database accessor in `lib/db/scoped.ts` — rather than by
remembering to write a `where` clause at each of the ~60 call sites.**

Specifically:

1. A `users` table gets a text (UUID) primary key. Every user-owned table
   gains `user_id text not null references users(id)`, plus a composite
   index leading with `user_id` wherever the table already had an index.
2. `questions` stays global and un-owned. The bank is shared read-only
   content; giving it an owner would fork the verified bank per user and
   break the authoring gate's guarantee that a question means the same
   thing everywhere.
3. `question_flags` **is** user-owned: the flag records who complained.
   The consequence of a flag — retiring a question — remains global and
   moves behind the admin surface in M6, where one person adjudicates.
4. Every server action, route handler, and server component reaches
   user data only through `ScopedDb`, obtained from the session. `ScopedDb`
   injects `user_id` on insert and conjoins `eq(table.userId, uid)` into
   every read, update and delete. It cannot be constructed without a
   user id.
5. A test asserts the choke point holds structurally — no module outside
   an explicit allowlist imports the raw `db` handle — alongside runtime
   tests that user A's requests cannot observe or mutate user B's rows.

Existing single-user data migrates into a first owner account by
back-filling `user_id` with that account's id on every row; nothing is
dropped and nothing is rewritten.

## Options rejected

**Move to Postgres (Neon or Supabase) and use row-level security.** RLS is
genuinely stronger: isolation survives an application bug, because the
database refuses the read. It lost on cost, not on merit. The move means
rewriting `lib/db/index.ts` and `lib/db/bootstrap.ts`, replacing the
libSQL driver and its migrator, regenerating all migrations for a different
dialect, and — the expensive part — auditing every one of the ~60 Drizzle
call sites in `lib/actions.ts`, `lib/engine.ts`, `lib/analytics.ts`,
`lib/plan-server.ts`, `lib/deck.ts`, `lib/mastery.ts`, `lib/decide.ts`,
`lib/redo.ts`, `lib/chapter-tests.ts`, `lib/pattern-stats.ts` and
`lib/settings.ts`, because libSQL's synchronous `.get()`/`.all()` terminators
do not exist on the Postgres driver. It also breaks the self-provisioning
boot that makes deploying Q86 a browser-only operation, and it introduces a
second running service in local development where today there is a file.
At the scale this product plausibly reaches in its first year, none of that
buys a customer anything. RLS is the right answer at the point where a
second engineer joins or a breach would be material; it is not the right
answer for the first paying user, and ADR 0001 should be revisited then.

**Database-per-tenant (one Turso database per user).** Turso supports this
and it gives perfect isolation for free. Rejected because it makes every
cross-tenant operation — admin triage, aggregate analytics, the shared
question bank, a migration — an N-database fan-out, and because the bank
loader would have to run per tenant, multiplying 360 questions by the user
count for no benefit. It also makes the free tier expensive.

**Keep one database and rely on a `where` clause per call site.** This is
what the milestone brief explicitly rules out, and correctly: it is one
forgotten clause away from a privacy incident, and nothing in the type
system or the test suite would notice. The scoped accessor exists so that
forgetting is a compile error or a failing structural test, not a leak.

## Migration cost

Moving to Postgres later costs, concretely: a new driver and migrator in
`lib/db/index.ts`; regenerating `drizzle/` for the `pg` dialect; converting
`.get()` → `.then(rows => rows[0])` and `.all()` → awaited arrays across the
call sites; replacing `integer(mode: "timestamp_ms")` columns with
`timestamptz`; replacing `text(mode: "json")` with `jsonb`; and a data
copy. Estimate: two to three days of focused work, most of it mechanical.

Crucially, the tenancy model itself does **not** need to change in that
move — `user_id` columns are exactly what RLS policies key on, so the
Postgres migration would *add* `create policy` statements on top of the
existing shape rather than reshaping the data. The scoped accessor would
become a redundant second belt rather than something to unpick.

## Reversibility

**Medium-high.** The tenancy shape is forward-compatible with the stronger
option, so the decision defers the Postgres question rather than foreclosing
it. What is genuinely hard to reverse is the choice to enforce in
application code: until RLS exists, a bug in `ScopedDb` is a cross-tenant
leak, which is why that module gets the densest test coverage in the repo.
