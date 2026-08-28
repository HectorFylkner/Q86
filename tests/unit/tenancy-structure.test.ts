import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Isolation is enforced by a module, so the risk is not that `ScopedDb`
 * is wrong — the runtime tests cover that — but that someone later
 * bypasses it. These are the structural rules that make bypassing it a
 * failing test rather than a silent leak (ADR 0001).
 */

const ROOT = process.cwd();

/**
 * Modules permitted to hold the raw Drizzle handle.
 *
 * `lib/db/*` is where the accessor lives. `lib/auth/*` owns the identity
 * tables, which have no tenant of their own. `lib/ai/pipeline.ts` writes
 * only to the shared question bank. `app/api/generate` and `lib/actions`
 * reach the bank for admin-gated retirement. Scripts and tests run
 * outside a request and resolve their own owner explicitly.
 */
const RAW_DB_ALLOWLIST = [
  "lib/db/index.ts",
  "lib/db/scoped.ts",
  "lib/db/bootstrap.ts",
  "lib/db/seed-bank.ts",
  "lib/db/app-settings.ts",
  "lib/auth/session.ts",
  "lib/auth/users.ts",
  "lib/actions.ts",
  "lib/ai/pipeline.ts",
  "app/api/generate/route.ts",
  // Admin-only cross-tenant triage: a flag reports the shared bank, and
  // retiring a question affects everyone, so the operator must see every
  // account's reports. The component refuses to render for non-admins.
  "components/analytics/flags-card.tsx",
  // Billing is written by Stripe, not by a request: the webhook resolves
  // the owner from a customer id, which is a lookup across accounts by
  // definition. See the OWNED_TABLES note below for why that is safe.
  "lib/billing/entitlements.ts",
  "lib/billing/webhook.ts",
];

/** Identifiers of the ten user-owned tables, as imported in application code. */
const OWNED_IDENTIFIERS = [
  "sessions",
  "attempts",
  "edits",
  "redoQueue",
  "patternAttempts",
  "eloRatings",
  "baselineReports",
  "settings",
  "deckReviews",
  "questionFlags",
];

function sourceFiles(): string[] {
  const out: string[] = [];
  const skip = new Set([
    "node_modules",
    ".next",
    ".git",
    "drizzle",
    "data",
    "public",
  ]);
  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        out.push(path.relative(ROOT, full));
      }
    }
  }
  for (const dir of ["app", "components", "lib"]) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full)) walk(full);
  }
  return out;
}

describe("tenancy choke point", () => {
  it("keeps the raw database handle inside the allowlist", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      if (RAW_DB_ALLOWLIST.includes(file)) continue;
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      // Any import that pulls `db` out of the db index, in either the
      // relative or the "@/" form.
      const imports = source.match(
        /import\s*\{[^}]*\}\s*from\s*["'](?:@\/lib\/db|\.{1,2}(?:\/[^"']*)?\/db\/index\.ts|\.\/index\.ts)["']/g,
      );
      if (!imports) continue;
      for (const statement of imports) {
        const named = statement
          .slice(statement.indexOf("{") + 1, statement.indexOf("}"))
          .split(",")
          .map((s) => s.trim().split(/\s+as\s+/)[0].trim());
        if (named.includes("db")) offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("carries a tenant predicate on every raw query against an owned table", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      if (file === "lib/db/scoped.ts") continue;
      const source = fs.readFileSync(path.join(ROOT, file), "utf8");
      // Each escape-hatch use of the handle, up to the end of its statement.
      const pattern = /\b(?:sdb|tx|b|a|scoped)\.q\b/g;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(source)) !== null) {
        const end = source.indexOf(";", match.index);
        const span = source.slice(match.index, end === -1 ? undefined : end);
        const touchesOwned = OWNED_IDENTIFIERS.some((table) =>
          new RegExp(`\\b(?:from|into|insert|update|delete)\\(${table}\\)`).test(
            span,
          ),
        );
        if (!touchesOwned) continue;
        // Either the tenant predicate, or an explicit owner on an insert.
        if (/\bown\(/.test(span) || /\buserId\b/.test(span)) continue;
        offenders.push(
          `${file}: ${span.split("\n")[0].trim()}…`,
        );
      }
    }
    expect(offenders).toEqual([]);
  });

  it("registers every owner-bearing content table in OWNED_TABLES", async () => {
    const schema = fs.readFileSync(
      path.join(ROOT, "lib/db/schema.ts"),
      "utf8",
    );
    // Split the schema into per-table declarations and keep those that
    // declare an owner column.
    const declared = new Set<string>();
    for (const block of schema.split("sqliteTable(").slice(1)) {
      const name = block.match(/^\s*"([a-z_]+)"/)?.[1];
      if (!name) continue;
      const body = block.slice(0, block.indexOf("\n);"));
      if (/text\("user_id"\)/.test(body)) declared.add(name);
    }
    // Tables that carry a user_id without being user content, each for a
    // stated reason. Anything else that grows an owner column has to be
    // registered in OWNED_TABLES or this test fails.
    const NOT_USER_CONTENT = {
      // Identity: these describe an owner rather than belonging to one.
      auth_sessions: "session records",
      auth_accounts: "federated identity links",
      auth_tokens: "single-use credentials",
      // Billing: `subscriptions` is keyed BY the owner, so there is no way
      // to read a row without naming whose it is — the primary key is the
      // tenant predicate. It is written by Stripe webhooks, which have no
      // session to scope to.
      subscriptions: "billing state, primary-keyed by owner",
      // An operator ledger. Its user_id is a trace of which account an
      // event resolved to, not a claim of ownership (it has no foreign key).
      stripe_events: "webhook idempotency ledger",
    } as const;
    for (const table of Object.keys(NOT_USER_CONTENT)) declared.delete(table);

    const { OWNED_TABLE_NAMES } = await import("@/lib/db/scoped");
    expect([...declared].sort()).toEqual([...OWNED_TABLE_NAMES].sort());
  });

  it("has removed the shared-password gate entirely", () => {
    const offenders: string[] = [];
    for (const file of [...sourceFiles(), "middleware.ts"]) {
      const full = path.join(ROOT, file);
      if (!fs.existsSync(full)) continue;
      if (fs.readFileSync(full, "utf8").includes("SITE_PASSWORD")) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
    expect(fs.existsSync(path.join(ROOT, "app/api/login/route.ts"))).toBe(false);
  });
});
