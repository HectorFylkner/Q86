# Launch checklist

In order. Each section gates the one after it: posting before the legal
block is done is how a launch becomes a problem, and posting before the
payment block is done is how it becomes a refund.

Nothing below has been done. Every box is the owner's.

---

## 1. Before anything is public

- [ ] **Company details filled in.** Legal name, organisationsnummer, VAT
      number, postal address. They go in `content/legal/sv/*.md`, which
      currently carries an explicit placeholder saying they are missing.
      Näringsidkares informationsplikt requires them before you sell.
- [ ] **A lawyer or a competent adviser has read the three legal pages.**
      They are written to be correct and specific; they are not advice.
- [ ] **An accountant has confirmed the 25 % moms assumption** in ADR
      0003 for a B2C electronically supplied service.
- [ ] **Domain bought and pointed.** `NEXT_PUBLIC_SITE_URL` set to it, or
      every canonical URL, reset link, referral link and sitemap entry
      points at localhost.
- [ ] **Support address exists and is monitored.**
      `NEXT_PUBLIC_SUPPORT_EMAIL`; the legal pages tell people to write to
      it.

## 2. Payments

- [ ] Stripe account in **test mode** with Stripe Tax on, Klarna enabled,
      and the two price ids created.
- [ ] `docs/BILLING.md` run end to end: a test purchase upgrades the
      account, a cancellation downgrades it, a replayed webhook changes
      nothing. **This has never been run** — no environment in this
      repository has ever had Stripe keys.
- [ ] Live keys swapped in and one real purchase made with your own card,
      then refunded.
- [ ] Receipt wording checked: it comes from Stripe, and it is what a
      customer keeps.

## 3. Mail

- [ ] Sending domain with SPF, DKIM and DMARC.
- [ ] `RESEND_API_KEY` and `EMAIL_FROM` set; `EMAIL_FROM` verified.
- [ ] One of each lifecycle message sent to yourself and read on a phone.
      Swedish quotation marks, no broken placeholder, no `{name}`.
- [ ] `pnpm email:lifecycle` scheduled hourly.
- [ ] A password reset done end to end from a real inbox.

## 4. Operations

- [ ] `AI_USER_MONTHLY_CAP_ORE` and `AI_GLOBAL_MONTHLY_CAP_ORE` set
      deliberately, not left at the defaults by accident.
- [ ] `SENTRY_DSN` set, and one deliberate error confirmed to arrive.
- [ ] A backup taken and **a restore rehearsed into a scratch directory**.
      A backup nobody has restored is a hope.
- [ ] An admin account promoted (`update users set role='admin' …`) and
      `/admin` opened once.
- [ ] `pnpm claim-owner` run if the production database carries
      pre-account history.

## 5. The site itself

- [ ] Read every public page on a phone, in Swedish, as a stranger.
- [ ] Take the diagnostic yourself, end to end, without an account.
- [ ] Check the Open Graph card renders by pasting a link into a chat.
- [ ] Submit the sitemap to Google Search Console; confirm `/idag` and
      `/kort/` are absent from it.
- [ ] Decline the cookie banner, reload, and confirm the site works and
      that no analytics script loaded.

## 6. Only now: the first posts

Order matters. The guides come first, because they are what makes a
subsequent post something other than an advertisement.

- [ ] Guides published and reachable; each one reads well on its own.
- [ ] **Your own accounts, under your own name.** No brand account
      pretending to be a person, no second account to agree with the
      first.
- [ ] r/GMAT — the build post. Expect scepticism about a new tool; answer
      it, do not argue with it.
- [ ] LinkedIn — the build note, to your own network.
- [ ] Wait a week. Read every reply. Fix what people say is wrong.
- [ ] Only then: r/sweden, Flashback, Facebook groups, student portals.

## 7. After the first week

- [ ] Read `/admin` once: which pages people actually reach, how many
      diagnostics were started versus finished, what the AI cost.
- [ ] Answer every reply on every post, including the unkind ones.
- [ ] Write down the three questions people asked that the site did not
      answer, and fix the site.

---

## The stop rule

If, at any point, the honest answer to *"would I send this to a friend
taking the GMAT in six weeks?"* is no — stop and fix the product instead
of the post. Marketing a thing that is not ready is how a small audience
is spent permanently.
