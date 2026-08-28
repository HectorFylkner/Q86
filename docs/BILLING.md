# Billing runbook

How Q86 charges, and what only you can do. The decisions behind it are in
[ADR 0003](adr/0003-payments.md).

## What the code does

- `lib/billing/pricing.ts` is the only place a price exists. The three
  plans are 0 kr, 249 kr/month, and 599 kr for three months, all
  VAT-inclusive. `tests/unit/paywall-structure.test.ts` fails if a price
  literal appears anywhere else.
- `lib/billing/entitlements.ts` is the only place that decides what an
  account may do. Pages call `requireFeature()`, server actions call
  `gateAction()`, and the same structural test fails if a page or an
  action forgets.
- `lib/billing/webhook.ts` applies Stripe events. It is replay-safe (every
  event id is written to `stripe_events` and a second delivery is a no-op)
  and order-safe (an event older than the one already applied is recorded
  as stale and ignored).
- Checkout runs with Stripe Tax enabled, collects the withdrawal-right
  waiver, and offers card and Klarna — plus Swish on the sprint plan only,
  because Swish cannot be used for a recurring charge.

## What is verified, and how

Run in this repository, against real Stripe **event shapes** but not
against Stripe itself:

```
pnpm test          # tests/unit/billing.test.ts — 22 tests
```

covering: a completed checkout upgrading an account; the sprint plan's
three-month window opening and closing on its own; a deleted subscription
downgrading; an early cancellation keeping access to the end of the paid
period; a failed payment keeping access but raising a flag; a replayed
event changing nothing; an out-of-order event refusing to undo a newer
one; an untraceable event being recorded rather than crashing; and one
account never resolving to another's plan.

```
npx playwright test tests/e2e/paywall.spec.ts
```

covering: the free tier reaching the chapters, the trainer and a capped
drill; every paid surface redirecting to `/konto`; the three prices
rendering with the VAT line; unauthenticated checkout and portal calls
being refused; and an unsigned webhook being rejected.

## What only you can do

A purchase against Stripe's own test mode cannot run here — there are no
keys in this environment, and none should be committed. The procedure:

1. **Create the account.** A Swedish Stripe account, in test mode.
   Settings → Tax: enable **Stripe Tax** and register Sweden.
   Settings → Payment methods: enable **Klarna** (and **Swish** if it is
   offered to you).

2. **Create the two prices**, both in SEK, tax behaviour **inclusive**:

   | Plan | Amount | Type |
   |---|---|---|
   | Månad | 249,00 SEK | Recurring, monthly |
   | GMAT-sprint | 599,00 SEK | One-time |

   Put their ids in `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_SPRINT`.

3. **Forward webhooks locally:**

   ```
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```

   Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`.

4. **Buy something.** With `STRIPE_SECRET_KEY=sk_test_…` set, start the app,
   sign in, open `/konto`, and press *Välj Månad*. Use test card
   `4242 4242 4242 4242`, any future expiry, any CVC. For Klarna, pick the
   Klarna option and choose the "authorised" outcome in its test screen.

   Expected: `/konto` shows **Månad · Aktiv** with a renewal date, the free
   tier's daily counter disappears, and `/timed` stops redirecting.

5. **Cancel it.** Press *Hantera prenumeration…*, cancel in Stripe's
   portal. Expected: the plan reads **Uppsagd** with the date access ends,
   and `/timed` keeps working until then.

6. **Replay an event.** In the Stripe dashboard, open the event that
   granted the subscription and press *Resend*. Expected: the app answers
   200, `stripe_events` still holds one row for that id, and the plan is
   unchanged.

7. **Check the tax.** Open the payment in Stripe and confirm the tax line
   reads 25 % Swedish VAT on a Swedish billing address. If it does not,
   the assumption in ADR 0003 needs revisiting before anything goes live.

## Before live keys

- An accountant's confirmation of the 25 % moms treatment in ADR 0003, and
  of whether you are registered for OSS if you sell outside Sweden.
- Business details Stripe requires: organisationsnummer, VAT number,
  registered address, and a bank account.
- A human review of `/kopvillkor`, `/angerratt` and `/integritetspolicy`
  (M4) — the withdrawal-right waiver collected at checkout has to match
  what those pages say.
- `NEXT_PUBLIC_SITE_URL` set to the real origin, so Stripe's return URLs
  and the password-reset links point at it.
