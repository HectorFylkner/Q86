# 0006 — Retention: granted access, outbound mail, and what a shared card contains

**Status:** Accepted (M5)

## Context

M5 adds four things that all touch the same two questions: who is allowed
in, and what leaves the building.

Referral codes grant paid features to someone who has not paid, which
means the paywall — a single function since ADR 0003 — has to learn a
second source of access without growing a second decision point. Lifecycle
email is the first outbound channel Q86 has ever had, and the first place
a bug is visible to a stranger's inbox rather than to a log. A shareable
progress card publishes something about an account to anyone holding a
URL. And onboarding asks a new account for information the plan will act
on, which is only worth asking for if it actually changes the plan.

## Decision

**Granted access is a separate additive table read by the same entitlement
function. Outbound mail claims its window in a ledger before it sends. The
progress card carries totals and nothing identifying, behind a rotatable
token. Onboarding asks exactly two questions, both of which change the
plan.**

- `access_grants` holds referral rewards and goodwill days. It is never
  written by Stripe and never overwrites `subscriptions`: a webhook
  arriving later cannot wipe a grant, and a grant cannot be mistaken for a
  payment. `resolveEntitlements` reads both and returns `grantedUntil`
  alongside `paid`, so the account page can say which one it is. A purchase
  outranks a grant when both are live.
- One referral pays both sides `REFERRAL_DAYS`. The payout is guarded by a
  unique index on `(user_id, reason, source_user_id)` rather than by
  check-then-insert, so a retry or a double submit cannot pay twice.
  Self-referral is refused explicitly.
- Codes are minted on first request, not at signup. An account that never
  opens the referral card never has a code, which is one fewer thing to
  leak, and the mint is a conditional update on a null column so two
  concurrent callers cannot each allocate one.
- Every lifecycle send writes `<userId>:<kind>:<window>` into `email_log`
  **before** delivering. Idempotency is therefore the primary key, not a
  query: the dispatcher can run hourly, twice by accident, or be replayed
  after a crash without anyone getting a duplicate. This is the same shape
  as the Stripe event ledger, for the same reason.
- Delivery is chosen by environment. Without `RESEND_API_KEY` messages are
  logged, which is what every environment in this repository does — "this
  build sends nothing" is a property of the configuration rather than a
  promise. A failed delivery throws rather than being swallowed, so a run
  that cannot deliver fails visibly instead of marking mail as sent.
- The progress card contains a streak, a question count, an accuracy and a
  chapter count. No email address, no name, no individual question, no
  answer. The token is a random rotatable column, so revoking it breaks
  every link already posted — the only meaningful undo for something
  shared. Card pages are `noindex`.
- Onboarding asks for a test date and a timed-set cadence, both of which
  are inputs `computeDailyPlan` reads, and then shows the week those
  answers produce by running that same planner. It can be skipped.

## Options rejected

**Write granted days into `subscriptions.current_period_end`.** One table,
one read, no change to the entitlement function. Rejected because Stripe
owns that row: the next `customer.subscription.updated` webhook would
overwrite the grant, and there would be no way to tell a referral reward
from a payment when the account page needs to explain what someone has.

**A `bonus_days` integer on the user.** Simpler than a table. Rejected
because it cannot answer "why", "from whom" or "when", which is exactly
what is needed when a referral is disputed or an operator wants to know
whether the scheme is being farmed.

**Check-then-insert for the referral payout.** Rejected: two signups on the
same code, or a double-submitted form, both race it. The index cannot.

**Send first, log after.** The obvious order, and wrong: a crash between
the two sends the message again on the next run. Claiming first can lose a
message if delivery fails after the claim — which is the better failure,
because a missing weekly digest is invisible and a duplicate is not.

**A queue table with retries.** Rejected as speculative for this milestone.
The dispatcher is a sweep over accounts; if it fails, the next run picks up
everything whose window is still open. A queue earns its complexity when
there is a volume problem, and there is not one yet.

**Deriving the share token from the user id (a hash or an HMAC).** No
column, no mint. Rejected because it cannot be rotated: the link would be
permanent, and "revoke" would be a lie.

**Putting streak, accuracy and the weakest subtopic on the card.** More
interesting to look at. Rejected for the weakest subtopic: it says
something about a person that they may not want a colleague to read, and
the card is shared into group chats.

## Migration cost

Migration 0004 is additive — four nullable columns and two new tables — so
it applies to a populated database without a rebuild, which
`tests/unit/migration-retention.test.ts` proves against a pre-M5 fixture
carrying accounts, a subscription and settings.

Undoing granted access means dropping `access_grants` and the branch in
`resolveEntitlements`; an hour, and any live grants are simply lost.
Swapping the mail provider is one file (`lib/email/transport.ts`) because
nothing else in the codebase knows how a message is delivered.

## Reversibility

**High for the mail transport and for onboarding.**

**Medium for referrals.** Once codes are in circulation they are printed in
other people's messages and posts. Changing `REFERRAL_DAYS` downward, or
withdrawing the scheme, is visible to people who were promised something —
so the number is a commitment, not a configuration value to tune.

**Medium for the progress card.** Adding a field to it later is easy;
removing one is not, because the cards already shared keep whatever they
were shared with. The current contents are the conservative choice on
purpose.
