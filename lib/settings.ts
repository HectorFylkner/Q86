import { desc, eq } from "drizzle-orm";
import type { ScopedDb } from "./db/scoped.ts";
import { baselineReports, settings, type BaselineReport } from "./db/schema.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";

/**
 * Per-account preferences. The three keys that configure the deployment
 * rather than a person (`model`, `seed_progress`, `user_retired_qids`)
 * moved to `lib/db/app-settings.ts` when Q86 became multi-tenant, so a
 * user cannot read or write instance state.
 */
export const SETTING_KEYS = [
  "test_date",
  "timed_set_cadence",
  "weight_overrides",
  "locale",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export async function getSetting(
  sdb: ScopedDb,
  key: SettingKey,
): Promise<string | null> {
  const row = await sdb.row(settings, eq(settings.key, key));
  return row?.value ?? null;
}

export async function putSetting(
  sdb: ScopedDb,
  key: SettingKey,
  value: string,
): Promise<void> {
  await sdb.q
    .insert(settings)
    .values({ userId: sdb.userId, key, value })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value },
    })
    .run();
}

export async function getLatestBaseline(
  sdb: ScopedDb,
): Promise<BaselineReport | null> {
  const rows = await sdb.q
    .select()
    .from(baselineReports)
    .where(sdb.own(baselineReports))
    .orderBy(desc(baselineReports.createdAt))
    .limit(1)
    .all();
  return rows[0] ?? null;
}

/** Weakness 0..1 per skill from the latest imported report's fundamental
 *  skill percentiles; null when nothing imported. */
export async function baselineWeakness(
  sdb: ScopedDb,
): Promise<Record<FundamentalSkill, number> | null> {
  const report = await getLatestBaseline(sdb);
  if (!report) return null;
  const parsed = report.parsed as {
    fundamental_skills?: Array<{ skill: string; percentile: number }>;
  };
  const rows = parsed.fundamental_skills ?? [];
  if (rows.length === 0) return null;
  const out = {} as Record<FundamentalSkill, number>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const row = rows.find((r) => r.skill === skill);
    // Missing skill in the report → neutral 0.5.
    out[skill] = row ? (100 - row.percentile) / 100 : 0.5;
  }
  return out;
}

export async function weightOverrides(
  sdb: ScopedDb,
): Promise<Partial<Record<FundamentalSkill, number>> | null> {
  const raw = await getSetting(sdb, "weight_overrides");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    const out: Partial<Record<FundamentalSkill, number>> = {};
    for (const skill of FUNDAMENTAL_SKILLS) {
      if (typeof parsed[skill] === "number") out[skill] = parsed[skill];
    }
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}
