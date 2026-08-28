import { eq } from "drizzle-orm";
import { db } from "./index.ts";
import { appSettings } from "./schema.ts";

/**
 * Instance configuration, owned by the operator. Deliberately outside
 * `ScopedDb`: these keys belong to the deployment, not to an account, so
 * no request-scoped code path can reach them (ADR 0001).
 */
export const APP_SETTING_KEYS = [
  "model",
  "seed_progress",
  "user_retired_qids",
] as const;
export type AppSettingKey = (typeof APP_SETTING_KEYS)[number];

export async function getAppSetting(
  key: AppSettingKey,
): Promise<string | null> {
  const row = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .get();
  return row?.value ?? null;
}

export async function putAppSetting(
  key: AppSettingKey,
  value: string,
): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } })
    .run();
}
