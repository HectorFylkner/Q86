import { desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { baselineReports, settings, type BaselineReport } from "./db/schema.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";

/** The only settings keys that exist (§6). */
export const SETTING_KEYS = [
  "test_date",
  "timed_set_cadence",
  "weight_overrides",
  "model",
  "seed_progress",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export async function getSetting(key: SettingKey): Promise<string | null> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  return row?.value ?? null;
}

export async function putSetting(key: SettingKey, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

export async function getLatestBaseline(): Promise<BaselineReport | null> {
  return (
    (await db
      .select()
      .from(baselineReports)
      .orderBy(desc(baselineReports.createdAt))
      .limit(1)
      .get()) ?? null
  );
}

/** Weakness 0..1 per skill from the latest imported report's fundamental
 *  skill percentiles; null when nothing imported. */
export async function baselineWeakness(): Promise<Record<
  FundamentalSkill,
  number
> | null> {
  const report = await getLatestBaseline();
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

export async function weightOverrides(): Promise<Partial<
  Record<FundamentalSkill, number>
> | null> {
  const raw = await getSetting("weight_overrides");
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
