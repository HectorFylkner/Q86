import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * "A page must not be able to forget the paywall" (ADR 0003) is a claim
 * about every route, not about the routes someone remembered. These rules
 * make forgetting one a failing test.
 */

const ROOT = process.cwd();

/**
 * Reachable without a session at all: the credential screens, plus the
 * whole public site. Everything under app/(marketing) is public by
 * definition, so it is matched by prefix rather than enumerated — but the
 * middleware test below then checks each of those routes individually.
 */
const PUBLIC_PAGES = [
  "app/(auth)/login/page.tsx",
  "app/(auth)/signup/page.tsx",
  "app/(auth)/forgot-password/page.tsx",
  "app/(auth)/reset-password/page.tsx",
];

const PUBLIC_PAGE_PREFIX = "app/(marketing)/";

/**
 * Pages that serve free and paid accounts alike. They may not use
 * `requireFeature`, but they must still resolve entitlements — a page that
 * asks no question about the plan is a page that has forgotten it.
 */
const MIXED_PAGES = ["app/(app)/idag/page.tsx", "app/(app)/konto/page.tsx"];

/** Routes that authenticate by something other than a session cookie. */
const PUBLIC_ROUTES = [
  "app/api/auth/google/route.ts",
  "app/api/auth/google/callback/route.ts",
  "app/api/auth/logout/route.ts",
  // Stripe signs its webhooks; a session would be meaningless here.
  "app/api/billing/webhook/route.ts",
];

const GUARDS = [
  "requireFeature(",
  "requireScoped(",
  "requireUser(",
  "requireAdmin(",
  "withEntitlements(",
];

function filesUnder(dir: string, match: RegExp): string[] {
  const out: string[] = [];
  function walk(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (match.test(entry.name)) out.push(path.relative(ROOT, full));
    }
  }
  walk(path.join(ROOT, dir));
  return out.sort();
}

const read = (file: string): string =>
  fs.readFileSync(path.join(ROOT, file), "utf8");

describe("paywall coverage", () => {
  it("gates every page, or lists it as public or mixed on purpose", () => {
    const ungated: string[] = [];
    for (const page of filesUnder("app", /^page\.tsx$/)) {
      if (PUBLIC_PAGES.includes(page)) continue;
      if (page.startsWith(PUBLIC_PAGE_PREFIX)) continue;
      const source = read(page);
      if (MIXED_PAGES.includes(page)) {
        if (!source.includes("withEntitlements(")) {
          ungated.push(`${page} (mixed, but never resolves entitlements)`);
        }
        continue;
      }
      if (!source.includes("requireFeature(")) {
        ungated.push(`${page} (no requireFeature, and not listed)`);
      }
    }
    expect(ungated).toEqual([]);
  });

  it("authenticates every API route, or lists it as public on purpose", () => {
    const open: string[] = [];
    for (const route of filesUnder("app", /^route\.ts$/)) {
      if (PUBLIC_ROUTES.includes(route)) continue;
      const source = read(route);
      if (!GUARDS.some((guard) => source.includes(guard))) open.push(route);
    }
    expect(open).toEqual([]);
  });

  it("keeps the public and mixed lists honest — no stale entries", () => {
    for (const file of [...PUBLIC_PAGES, ...MIXED_PAGES, ...PUBLIC_ROUTES]) {
      expect({ file, exists: fs.existsSync(path.join(ROOT, file)) }).toEqual({
        file,
        exists: true,
      });
    }
  });

  /**
   * Two ways to get the public site wrong, and the middleware is where
   * both show up: a marketing page missing from PUBLIC_PREFIXES redirects
   * a stranger to a login form, and an application path appearing there
   * would serve someone else's product to anyone.
   */
  describe("the middleware's public list", () => {
    const middleware = read("middleware.ts");
    const prefixes = Array.from(
      middleware
        .slice(middleware.indexOf("const PUBLIC_PREFIXES"))
        .slice(0, middleware.slice(middleware.indexOf("const PUBLIC_PREFIXES")).indexOf("];"))
        .matchAll(/"([^"]+)"/g),
    ).map((m) => m[1]);

    /** "/priser/page.tsx" from "app/(marketing)/priser/page.tsx". */
    function routeOf(page: string): string {
      const inner = page
        .slice(PUBLIC_PAGE_PREFIX.length)
        .replace(/\/?page\.tsx$/, "");
      return inner === "" ? "/" : `/${inner}`;
    }

    it("covers every page on the public site", () => {
      const uncovered: string[] = [];
      for (const page of filesUnder("app", /^page\.tsx$/)) {
        if (!page.startsWith(PUBLIC_PAGE_PREFIX)) continue;
        const route = routeOf(page).replace(/\/\[[^\]]+\]$/, "");
        if (route === "/") continue; // handled by an explicit branch
        if (!prefixes.some((prefix) => route.startsWith(prefix))) {
          uncovered.push(`${route} (${page})`);
        }
      }
      expect(uncovered).toEqual([]);
    });

    it("exposes the landing page and nothing else at the root", () => {
      // "/" cannot be a prefix — every application path starts with it —
      // so the middleware special-cases the exact path. If that branch
      // disappears, the landing page becomes a redirect.
      expect(middleware).toContain('if (pathname === "/") return true;');
    });

    it("lets no application route into the public list", () => {
      const appRoutes = filesUnder("app", /^page\.tsx$/)
        .filter((page) => page.startsWith("app/(app)/"))
        .map((page) => `/${page.slice("app/(app)/".length).replace(/\/page\.tsx$/, "")}`);
      const leaked = appRoutes.filter((route) =>
        prefixes.some((prefix) => route.startsWith(prefix)),
      );
      expect(leaked).toEqual([]);
    });
  });

  it("writes no price anywhere but the pricing module", () => {
    // The three defaults, in kronor and in öre, as a bare literal.
    const patterns = [/\b249\b/, /\b599\b/, /\b24_?900\b/, /\b59_?900\b/];
    const offenders: string[] = [];
    const sources = [
      ...filesUnder("app", /\.(ts|tsx)$/),
      ...filesUnder("components", /\.(ts|tsx)$/),
      ...filesUnder("lib", /\.(ts|tsx)$/),
    ];
    for (const file of sources) {
      if (file === "lib/billing/pricing.ts") continue;
      const source = read(file);
      for (const pattern of patterns) {
        if (pattern.test(source)) offenders.push(`${file} matches ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("gates every server action that is not deliberately free", () => {
    // Reading your own history, tagging your own miss, closing your own
    // session, changing a preference, and reporting a bad question are
    // free on every plan. Everything else in lib/actions.ts must gate.
    const FREE_ACTIONS = [
      "getQuestionHistory",
      "tagAttempt",
      "finishSession",
      "saveSetting",
      "flagQuestion",
      "resolveFlag", // admin-gated instead
    ];
    const source = read("lib/actions.ts");
    const exported = [
      ...source.matchAll(/export async function (\w+)/g),
    ].map((m) => m[1]);
    expect(exported.length).toBeGreaterThan(10);

    const ungated: string[] = [];
    for (const name of exported) {
      if (FREE_ACTIONS.includes(name)) continue;
      const start = source.indexOf(`export async function ${name}`);
      const next = source.indexOf("\nexport ", start + 1);
      const body = source.slice(start, next === -1 ? undefined : next);
      if (!body.includes("gateAction(")) ungated.push(name);
    }
    expect(ungated).toEqual([]);
  });
});
