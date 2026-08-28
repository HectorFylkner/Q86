# ADR 0002 — Authentication and session management

**Status:** Accepted · **Date:** 2026-08-28 · **Milestone:** M0, binding on M1

## Context

Authentication today is one shared secret. `middleware.ts` compares a
cookie against `sha256(SITE_PASSWORD)` on every route and redirects to
`/login` when it does not match; `app/api/login/route.ts` sets that cookie.
There is no user record, so there is nothing for a session to point at.

M1 needs real accounts: signup, login, logout, password reset, and Google
OAuth, with a session object that yields the `user_id` that ADR 0001's
scoped accessor requires. M2 needs that same user record to hang a Stripe
customer off. M6 needs a role so an admin surface can exist.

The constraint that decides this is testability. The verification standard
for this build is that tenant isolation, the paywall, and signup are proved
by tests that run in CI with no network. An auth system whose session
issuance requires a third-party API cannot be tested that way without
mocking the thing under test.

## Decision

**Own the session layer. Password + session-cookie authentication built on
the existing database, with Google as the one federated provider, spoken
directly over OIDC rather than through an SDK.**

Concretely, in `lib/auth/`:

- **Password hashing:** `scrypt` from `node:crypto` (N=16384, r=8, p=1,
  32-byte key, 16-byte random salt), stored as `scrypt$N$r$p$salt$hash`.
  Verification is constant-time via `timingSafeEqual`. No native module, no
  install step, no platform-specific binary — which matters because the
  question-authoring harness and CI both run on plain Node.
- **Sessions:** a `auth_sessions` row keyed by the SHA-256 of a 32-byte
  random token. The raw token lives only in an httpOnly, SameSite=Lax,
  Secure-in-production cookie; the database never holds a usable
  credential. Sessions last 30 days and slide forward when used inside the
  last week.
- **Google OAuth:** the authorization-code flow written against Google's
  OIDC endpoints with `fetch`, with `state` and PKCE stored in short-lived
  httpOnly cookies. About 120 lines, no dependency, and the whole flow is
  behind one module so a second provider is an addition rather than a
  rewrite.
- **Password reset:** single-use tokens in `auth_tokens`, hashed at rest,
  30-minute expiry, invalidated on use and on password change. The same
  table backs magic-link sign-in and email verification, distinguished by a
  `kind` column.
- **Route protection** moves from a password check in `middleware.ts` to a
  session check. `middleware.ts` keeps only the cheap redirect for
  unauthenticated access to app routes; the authoritative check is
  `requireUser()` in every server action and route handler, because
  middleware alone is not an authorization boundary.

`SITE_PASSWORD` and `app/api/login/route.ts` are deleted in M1 once the
replacement covers every route the matcher covered.

## Options rejected

**Auth.js / NextAuth v5.** The obvious default, and it would have worked.
It lost on three specifics. Its Drizzle adapter dictates its own table
shapes (`account`, `session`, `verificationToken`) which then sit beside our
own `users` table conventions rather than inside them. Its v5 App Router
API has been in beta for the whole life of this codebase and its session
callbacks are an awkward fit for handing a `user_id` to a synchronous-ish
Drizzle accessor. And credential-based signup — email + password with our
own reset flow — is the path Auth.js documents least and supports most
grudgingly, while it is the primary path for a Swedish buyer who does not
want a Google account attached to their exam prep.

**Clerk or WorkOS.** Excellent products, wrong shape here. Both put the
user record in someone else's database, which means the `user_id` that
ADR 0001 keys every row on becomes an external identifier we do not
control, GDPR data-subject deletion (required by M4's integritetspolicy)
becomes a two-system dance, and the isolation tests need a network. Clerk's
pricing also starts charging per monthly active user at a threshold this
product would cross before it is profitable.

**Supabase Auth.** Would be the right answer if ADR 0001 had chosen
Postgres — the pairing is the point of Supabase. It is not, so it would mean
running a second database purely for identity.

## Migration cost

Moving to a hosted provider later means: importing existing users
(scrypt hashes are portable into anything that accepts a custom hasher, and
Clerk/Auth0 both do); mapping our UUID `users.id` to their identifier, or
keeping ours as external metadata; rewriting `lib/auth/session.ts` so
`requireUser()` reads their session instead of ours; and deleting our
`auth_sessions` / `auth_tokens` tables. The rest of the application never
sees an auth type — it sees a `user_id` from `requireUser()` — so the blast
radius is genuinely one directory. Estimate: one day.

The reverse migration (provider → self-hosted) is the expensive direction,
because password hashes are usually not exportable. Starting self-hosted
keeps the cheap direction available.

## Reversibility

**High.** Every consumer of authentication depends on the single function
`requireUser(): Promise<SessionUser>`, not on how the session was
established. The risk this decision accepts is not lock-in; it is that we
own security-sensitive code. That is mitigated by using only standard
primitives from `node:crypto`, by never storing a usable token, and by
testing the flows that matter in Playwright.
