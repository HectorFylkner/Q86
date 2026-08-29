# 0005 — The public site, the route split, and where the application lives

**Status:** Accepted (M4)

## Context

Until M4 the whole product sat behind a session: `/` was the dashboard, and
`middleware.ts` redirected anything else to `/login`. That is correct for an
application and useless for acquisition. A stranger arriving from a search
result for "GMAT förberedelse" got a login form, and a crawler got a 307.

M4 has to add a public site — landing page, pricing, a free diagnostic,
guides, and the legal pages Swedish e-commerce requires — without weakening
the guarantee that every application page authenticates. Three questions
follow: where the application lives once the root is public, how the two
surfaces get different chrome, and how the middleware avoids becoming the
place a mistake exposes an app route.

Two constraints shape the answers. The public site must be Swedish at the
root, because the search intent is Swedish (ADR 0004). And the free
diagnostic reads the verified question bank for a visitor who has no
account, which is the first time anything does that.

## Decision

**The application moves to `/idag`; `/` is the public landing page. The
`app/` tree splits into three route groups, each with its own chrome. The
middleware keeps default-deny and gains an explicit public list, which a
structural test checks against the filesystem in both directions.**

- `app/(marketing)/` — the public site, on the editorial surface.
  `app/(app)/` — the signed-in application, with the nav and the tab bar.
  `app/(auth)/` — the credential screens, on the bare ground. The root
  layout keeps only the fonts, the providers and the i18n context, because
  a landing page wants full-bleed sections and the app wants a fixed
  measure, and one layout cannot serve both.
- `AFTER_SIGN_IN` is `/idag`. Signing out goes to `/login`, not to the
  landing page: someone signing out on a shared machine wants the door
  shut.
- `middleware.ts` still denies by default. `/` is a special case (it cannot
  be a prefix — every application path starts with it), and everything else
  public is listed. `tests/unit/paywall-structure.test.ts` asserts that
  every page under `app/(marketing)/` is covered by that list and that no
  page under `app/(app)/` is. Both directions of the mistake fail a test.
- The diagnostic reads the bank through the raw handle, which
  `tests/unit/tenancy-structure.test.ts` allows by name with a reason. It
  writes nothing at all — no row, no cookie, no localStorage — so an
  anonymous visitor leaves no trace. Correct answers never reach the
  browser: `diagnosticQuestions()` strips them and `scoreDiagnostic()`
  re-reads the key from the bank server-side.
- The plan preview calls `computeDailyPlan`, the product's real planner,
  rather than a marketing mock-up of one.
- The public site gets a second Markdown renderer,
  `components/site/article.tsx`, for tables, rules and links.
  `components/math.tsx` — which renders question stems and lesson chapters
  — is untouched.

## Options rejected

**Branch inside a single `/` page: dashboard for a session, landing page
otherwise.** Keeps every existing link and needs no move. Rejected because
the two surfaces want different chrome and different layout constraints,
so the branch would have had to reach up into the layout; and because a
crawler's view of `/` would then depend on a cookie, which is exactly the
condition that produces indexing surprises.

**Invert the middleware: protect a list of app prefixes, allow the rest.**
Shorter, and the public list stops growing. Rejected because the failure
mode is unbounded: forgetting to add a new app route exposes it, whereas
forgetting to add a public route only produces a visible redirect. Default-
deny fails safe; default-allow fails open.

**A separate marketing site (a static generator on its own domain).** Would
isolate the public pages completely and let them be built as pure static
files. Rejected because the diagnostic needs the verified bank and the real
planner, and a second deployment that had to reach both would either
duplicate them or need an API across a domain boundary. The funnel's whole
argument is that the preview is the real thing.

**Extend `components/math.tsx` with tables and links.** One renderer
instead of two. Rejected: that component is on the path that renders
question stems, and the brief is explicit that the bank and its rendering
are load-bearing. Gaining a table is not a reason to touch it.

**A locale segment (`/sv/…`, `/en/…`).** Rejected in ADR 0004 and
unchanged here: the search intent is Swedish, and the toggle plus the
account preference already carry the language.

## Migration cost

Moving the application back under `/` would mean reverting the route-group
move (mechanical, `git mv`), changing `AFTER_SIGN_IN` and the two in-app
"back to today" links, and updating four E2E specs. Half a day.

Moving the public site to its own deployment later is the more likely
change and is cheaper than it looks: `app/(marketing)/` has no imports from
the application beyond `lib/diagnostic.ts`, `lib/diagnostic-plan.ts`,
`lib/guides.ts`, `lib/legal.ts` and the i18n catalogs. The diagnostic is
the only piece that needs the database.

## Reversibility

**High for the routing**, which is a rename and a set of links.

**Medium for the diagnostic's contract.** Once the free diagnostic is
public, changing what it costs (an email address, an account) is a visible
takeaway, not an implementation detail. The current contract — twelve
questions, no account, nothing stored — is the one the landing page
promises in writing, so it should be treated as a commitment rather than a
default.
