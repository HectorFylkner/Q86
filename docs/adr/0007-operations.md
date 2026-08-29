# 0007 — Cost caps, error reporting, and analytics that survive a refusal

**Status:** Accepted (M6)

## Context

Three endpoints spend the operator's money on every call: `/api/generate`,
`/api/coach` and `/api/parse-report`. Until M6 the only limit on them was
authentication — a subscriber, or a loop in a subscriber's browser, could
have run up a bill with nothing to stop it and nothing to notice it. The
same milestone needs to know when something throws in production, and to
answer "is anyone reading the guides" without becoming the kind of site
whose privacy policy has to be written carefully.

Two constraints from the brief bear directly on all three: the verified
bank and its authoring gate are load-bearing, so metering must not change
how generation works; and analytics must survive the cookie banner, which
rules out the usual answer of loading a third-party script and hoping.

## Decision

**Meter every paid call into a ledger with the provider's own token
counts; refuse at four thresholds before the call, not after. Report
errors through one dependency-free seam. Count pages server-side with no
identifier at all.**

- `api_usage` holds one row per call: tokens in, tokens out, the öre those
  imply at the prices in `lib/ops/costs.ts`, and whether the call
  succeeded. Storing the raw counts as well as the derived cost means a
  price change is a re-read of history rather than a lost one.
- Four limits, checked in order: calls per hour, calls per day, monthly
  cost per account, monthly cost across the service. A rate limit protects
  the service and a cost cap protects the bill; a runaway loop trips the
  first long before the second. The global cap is deliberately blunt —
  when it trips every account is refused — because that is the correct
  behaviour for a bill that is running away.
- A failed call is metered too. It reached the provider and was billed,
  and a meter that counted only successes would under-report exactly when
  something is going wrong.
- `refuseIfOverBudget` and `recordUsage` are one helper used by all three
  routes, and `tests/unit/ops.test.ts` asserts that *every* route which
  reaches `getModel()` calls both — so a fourth spending endpoint fails a
  test rather than an invoice.
- Errors go through `captureError`, which posts a Sentry envelope over
  `fetch` when `SENTRY_DSN` is set and logs otherwise. Reports carry an
  account id at most; never an address, never a name.
- `page_views` counts paths per day server-side. No account id, no
  session, no IP, no hash of an IP, no device fingerprint, and nothing
  read from or written to the visitor's device. It therefore needs no
  consent and keeps counting when someone declines the banner.
- `/admin` is gated by `requireAdmin()` rather than by `requireFeature()`:
  an operator's entitlements are irrelevant, and the page reads across
  every account by design.

## Options rejected

**A rate limiter in front of the app (a proxy, a WAF rule, an edge KV
counter).** Fewer moving parts in the application. Rejected because the
limit that matters is *cost*, not requests, and cost is only knowable
after the provider answers — an edge counter cannot see tokens, and a
1 000-token call and a 100 000-token call are not the same event.

**Estimating cost from the request rather than metering the response.**
Would let the check include the call in flight. Rejected because the
estimate would be wrong in both directions and a cap built on a guess is a
cap nobody can trust. The caps are instead set well below what any single
call could spend, so excluding the in-flight call changes nothing.

**A running total column instead of a row per call.** One update instead
of an insert, and a cheaper read. Rejected: it cannot answer which route,
which account or which day, which is the entire content of "why was the
bill that size".

**The Sentry SDK.** Breadcrumbs, source maps, automatic instrumentation.
Rejected for this milestone: it is a runtime that hooks every module, and
what is actually needed is knowing that a webhook or a lifecycle run threw.
The seam is thirty lines and swapping it for the SDK later is one file.

**A third-party analytics script (Plausible, Fathom, GA).** Rejected on
the brief's own terms. Even a cookieless third party is a request to
another company carrying the visitor's IP and page, which needs consent to
be safe — and consent-gated analytics do not survive the banner, which was
the requirement. Counting server-side with nothing stored does.

**Logging the IP, even hashed, for unique visitors.** Rejected: a hashed
IP is still personal data, and "unique visitors" is not worth becoming a
site that processes them.

**Rate limiting by IP as well as by account.** Rejected as unnecessary:
all three endpoints already require a session, so the account is a
stronger key than an address, and adding an IP dimension would mean
storing addresses that nothing else needs.

## Migration cost

Migration 0005 adds two tables and touches nothing, so it applies to a
populated database without a rebuild.

`PipelineResult` gained a `usage` field so `/api/generate` can meter
honestly rather than estimate. That is additive — nothing in the authoring
gate reads it, and generation behaves exactly as before — but it is a
change to the exam-critical path and is called out here for that reason.

Removing the caps entirely is deleting two calls per route and one module.
Swapping the error transport is one file. Removing the page counter is one
table and one call in the marketing layout.

## Reversibility

**High for error reporting and analytics.**

**Medium for the caps.** The numbers become expectations: an account that
has been using the coach freely will notice a cap appearing, and lowering
one after launch is a takeaway. `AI_USER_MONTHLY_CAP_ORE` and
`AI_GLOBAL_MONTHLY_CAP_ORE` exist so the numbers can move without a
deploy, but the *shape* — that there is a per-account cap at all — should
be treated as settled.
