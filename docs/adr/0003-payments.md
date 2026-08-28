# ADR 0003 — Payment provider, pricing currency, and Swedish VAT

**Status:** Accepted · **Date:** 2026-08-28 · **Milestone:** M0, binding on M2

## Context

Q86 has no billing of any kind. The buyer is a Swedish GMAT candidate who
expects to pay in kronor, by card or Klarna, and increasingly by Swish. The
competing products — TTP, Manhattan Prep — price in USD, which is a small
but real friction for that buyer and one of the few places Q86 can be
plainly better without claiming anything about score outcomes.

Selling a digital subscription to Swedish consumers carries obligations
that are not optional: moms must be charged and shown, the price displayed
to a consumer must be VAT-inclusive under prisinformationslagen, and
distansavtalslagen's 14-day withdrawal right applies unless the customer
expressly waives it for digital content delivered immediately.

## Decision

**Stripe, in test mode for this entire build, with prices denominated in
SEK and Stripe Tax computing moms.**

- **Payment methods:** card and Klarna at minimum — Klarna is close to
  table stakes for a Swedish consumer purchase. Swish is enabled if the
  connected account exposes it; because Swish is a one-time payment method
  and not usable for recurring charges, it is offered on the fixed-length
  "GMAT-sprint" plan only, never on the monthly subscription. Payment
  method availability is read from the account rather than hard-coded, so
  an account without Swish degrades to card + Klarna instead of erroring.
- **Plans**, all defined in `lib/billing/pricing.ts` and never inline:
  - `free` — 0 kr. The diagnostic, the Learn chapters, and a capped daily
    drill allowance.
  - `monthly` — 249 kr/month, recurring.
  - `sprint` — 599 kr for three months, a fixed-length plan that ends
    rather than renewing, which matches how someone with a booked test date
    actually buys.
  These are defaults, editable in one module; the Stripe price IDs they map
  to come from environment variables, so test and live never mix in code.
- **VAT assumption, stated here rather than buried:** Q86 is treated as a
  B2C supply of an electronically supplied service to Swedish consumers, at
  the standard Swedish rate of **25 %**. Displayed prices are
  VAT-inclusive, so 249 kr means 249 kr at checkout, of which 49,80 kr is
  moms. Stripe Tax is enabled and is authoritative at checkout: if the
  customer is not in Sweden, Stripe computes the correct destination rate
  and our display price is recalculated rather than assumed. This
  assumption should be checked by an accountant before live keys are used —
  it is stated as an assumption because it is one.
- **Webhooks** are idempotent by construction. Every event id is written to
  a `stripe_events` ledger inside the same transaction that applies the
  event; a replayed event finds its id present and returns 200 without
  re-applying. Out-of-order delivery is handled by never trusting event
  order: the handler re-reads subscription state from Stripe (or from the
  event's own object, which carries the full current state) and writes the
  resulting entitlement, so an older event cannot overwrite a newer state.
- **Entitlements resolve through exactly one function**,
  `resolveEntitlements(userId)`. A page cannot forget the paywall because a
  page does not decide the paywall; it asks.

## Options rejected

**Paddle (merchant of record).** Genuinely attractive: Paddle becomes the
seller of record and takes the entire VAT and invoicing burden — including
the OSS filing that Stripe leaves to us — which for a solo operator is the
single biggest reason to choose it. Rejected on payment methods: Paddle's
Swedish coverage is card and PayPal, with no Klarna and no Swish. For this
specific buyer, losing Klarna costs more conversion than gaining
outsourced VAT saves in effort. If Q86 sells meaningfully outside Sweden,
this trade flips and ADR 0003 should be revisited.

**Lemon Squeezy.** Same merchant-of-record benefit, smaller and now inside
Stripe, with a higher effective fee and weaker subscription primitives
(no equivalent of the customer portal we get for free). No reason to prefer
it over Paddle if we were choosing a merchant of record at all.

**Klarna direct + card via a PSP.** Cheaper per transaction, and Klarna's
own API is good. Rejected because we would then own subscription lifecycle,
dunning, proration, invoicing, the customer portal, and tax — months of
work that Stripe does correctly, to save basis points on revenue that does
not exist yet.

**Billing our own subscriptions against Stripe Payment Intents.** More
control, and avoids Stripe's subscription object. Rejected for the same
reason: dunning and proration are much harder than they look, and the
customer portal is a real product we would otherwise have to build.

## Migration cost

Moving to Paddle later means: re-mapping three prices; rewriting the
checkout session creation and the webhook handler (Paddle's event shapes
differ but the entitlement outcome is the same three plans); replacing the
Stripe customer portal with Paddle's; and — the genuinely hard part —
migrating existing subscriptions, which cannot be transferred between
processors and must be re-collected from each customer. That last item
means the cost of this decision rises with every paying subscriber, which
is exactly why the ADR is written now rather than after launch.

The code cost is contained: all Stripe knowledge lives in `lib/billing/`,
and the rest of the application asks `resolveEntitlements()` a question
about plans, never about Stripe.

## Reversibility

**Medium before launch, low after.** Nothing in this build touches live
keys or real money, so the decision is free to change today. It becomes
expensive at the first real subscriber, and progressively more so. The
mitigation is that the *interface* — three plans, one entitlement resolver
— is provider-agnostic, so a switch is a rewrite of one directory plus a
customer-facing re-subscription campaign, not a rewrite of the product.
