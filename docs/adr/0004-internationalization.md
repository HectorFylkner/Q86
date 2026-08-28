# ADR 0004 — Localization approach and the exam-fidelity boundary

**Status:** Accepted · **Date:** 2026-08-28 · **Milestone:** M0, binding on M3

## Context

Every user-facing string in Q86 is hard-coded English, across roughly two
dozen route files and thirty-odd components. The 24 lesson chapters in
`content/lessons/` — about 34 000 words — are English markdown read
through `lib/lessons.ts` and `lib/lesson-parse.ts`.

The buyer is Swedish, fluent in English, and reads Swedish faster under
stress. That last clause is the whole argument: instruction in Swedish over
exam content in English is one of the three honest differentiators this
product has, and it is the one no competitor is positioned to copy quickly.

There is a hard line running through this. The GMAT is administered in
English. A candidate who practises on Swedish question stems will meet
English stems on test day having trained the wrong reading task, and the
mathematical difficulty of a GMAT quant question is often carried by
precise English phrasing — "is an integer", "must be", "could be",
"sufficient". Translating stems would make the product worse while making
it look more localized.

## Decision

**A hand-rolled, typed message catalog with `sv` as the default locale and
`en` as the fallback. No locale segment in the URL for application routes.
Locale persists on the account.**

- `lib/i18n/` holds `sv.ts` and `en.ts`, each a nested object of message
  functions and strings, typed so that `sv` is the source of truth for the
  key set and `en` must satisfy the same type. A missing English string is
  a compile error, not a runtime blank.
- Locale resolution order: the signed-in account's `locale` column →
  a `q86_locale` cookie (so the marketing site works before signup) →
  `Accept-Language` → `sv`.
- Formatting goes through `Intl` with the resolved locale: `sv-SE` gives
  `28 augusti 2026`, `1 234,5`, and `249,00 kr`. A small `lib/i18n/format.ts`
  wraps the three cases the product actually uses (date, number, currency)
  so no component constructs an `Intl` formatter itself.
- The application shell is served from unprefixed paths (`/drill`,
  `/analytics`). The marketing site is Swedish at the root — which is the
  correct SEO decision, because the search intent we target is Swedish
  ("GMAT förberedelse", "plugga inför GMAT", "GMAT vs Högskoleprovet") —
  with English available through the same toggle.

**The exam-fidelity boundary, which is absolute:**

| Stays English | Becomes Swedish |
|---|---|
| Question stems (`questions.stem_md`) | Every interface string |
| Answer choices (`questions.choices`) | Lesson prose |
| Data Sufficiency statements and the canonical five choices | Solution commentary and coaching |
| Mathematical notation everywhere | Error-taxonomy labels |
| GMAT terminology: Data Sufficiency, Problem Solving, Quantitative Reasoning, Focus Edition | Emails, legal pages, marketing |

No migration, no script, and no marketing change may write to
`questions.stem_md`, `questions.choices`, or `questions.correct_index`.
`scripts/verify-bank.ts` continues to check the bank against
`scripts/seed-bank.json` unchanged and unweakened.

Lesson chapters are translated as parallel files —
`content/lessons/sv/<subtopic>.md` beside the existing English, which moves
to `content/lessons/en/`. `lib/lessons.ts` resolves by locale and falls
back to English when a Swedish chapter is absent, so a partially translated
state is a working state rather than a broken one. Mathematical notation and
the GMAT terms above are left in English inside the Swedish prose.

## Options rejected

**next-intl with `app/[locale]/` routing.** The standard answer and a good
library. Rejected on churn: it requires moving every one of the ~24 route
files under a `[locale]` segment, rewriting every internal `Link` to be
locale-aware, and reworking `middleware.ts` for locale negotiation — a
large mechanical diff across working subsystems that this milestone does
not otherwise need to touch, in a codebase whose brief explicitly forbids
rewriting working subsystems. Its main payoff, per-locale URLs for SEO,
matters only for the marketing pages, which are a dozen routes we are
writing from scratch and can shape however we like. If Q86 ever needs a
third locale or genuinely bilingual SEO, this is the migration to make.

**next-i18next / react-i18next.** Built for the Pages Router and for
client-side translation; awkward under React Server Components, where most
of Q86's strings live. Adds a runtime and an ICU parser for interpolation
that TypeScript template literals already do more safely.

**Machine-translating the lesson chapters at build time.** Fast, and wrong.
The lessons are the pedagogy — they are the reason someone would pay rather
than read a free forum post — and a machine translation of a mathematical
explanation gets terminology subtly wrong in ways a learner cannot detect
and therefore cannot correct for. They are translated as prose, chapter by
chapter, with notation and GMAT terms deliberately left in English.

**Translating question stems too, for a "fully Swedish" product.** Rejected
on exam fidelity, as above. It would also invalidate the authoring gate:
`scripts/author/harness.mjs` verifies questions by brute force against the
English stem, and a translated stem is a different, unverified question.

## Migration cost

Moving to next-intl later: the message catalogs port almost directly (its
catalog is a nested object too), so the cost is the routing change —
relocating routes under `[locale]`, updating internal links, and adding
locale middleware. Estimate: one to two days, and it gets slightly cheaper
if the marketing routes are written now with their paths held in one
constants module, which they are.

Adding a third locale under the current design costs one file plus
translation, with the type system listing every missing key.

## Reversibility

**High.** No data model depends on this choice — locale is one column on
`users` — and no third-party contract binds it. The genuinely irreversible
part is not technical: it is the decision to translate 34 000 words of
lesson prose, which is a sunk editorial cost in Swedish that a pivot to a
different market would not recover.
