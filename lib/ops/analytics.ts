import { sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { pageViews } from "../db/schema.ts";

/**
 * Cookieless, aggregate page counting.
 *
 * One counter per path per day. No identifier of any kind is stored or
 * derived: no account id, no session, no IP, no hash of an IP, no device
 * fingerprint. Nothing is read from or written to the visitor's device
 * either, which is why this keeps working when someone declines the
 * cookie banner — there is nothing for them to decline.
 *
 * The trade is real and worth stating: this cannot tell a returning
 * visitor from a new one, and cannot follow anyone through a funnel. What
 * it can do is answer "is anyone reading the guides" without collecting a
 * single thing about the people who are.
 */

/** Paths that would multiply into thousands of rows, or say something
 *  about one person. A share card's URL identifies its owner. */
const IGNORED = [/^\/kort\//, /^\/api\//, /^\/_next\//];

/** Only the public site is counted; the application is not a funnel. */
const COUNTED = [
  /^\/$/,
  /^\/priser$/,
  /^\/diagnos$/,
  /^\/guider(\/[a-z0-9-]+)?$/,
  /^\/integritetspolicy$/,
  /^\/kopvillkor$/,
  /^\/angerratt$/,
  /^\/signup$/,
  /^\/login$/,
];

export function shouldCount(path: string): boolean {
  if (IGNORED.some((pattern) => pattern.test(path))) return false;
  return COUNTED.some((pattern) => pattern.test(path));
}

export function dayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Increment the counter. One upsert, no read, and it never throws: a
 * counter is not worth failing a page render over.
 */
export async function countView(
  path: string,
  now: Date = new Date(),
): Promise<void> {
  if (!shouldCount(path)) return;
  const day = dayKey(now);
  try {
    await db
      .insert(pageViews)
      .values({ id: `${day}:${path}`, day, path, views: 1 })
      .onConflictDoUpdate({
        target: pageViews.id,
        set: { views: sql`${pageViews.views} + 1` },
      });
  } catch (error) {
    console.error("[analytics] count failed:", error);
  }
}

export type ViewRow = { path: string; views: number };

/** Totals per path over the last `days` days, for the admin surface. */
export async function recentViews(
  days = 30,
  now: Date = new Date(),
): Promise<ViewRow[]> {
  const since = dayKey(new Date(now.getTime() - days * 86_400_000));
  return db
    .select({
      path: pageViews.path,
      views: sql<number>`sum(${pageViews.views})`,
    })
    .from(pageViews)
    .where(sql`${pageViews.day} >= ${since}`)
    .groupBy(pageViews.path)
    .orderBy(sql`sum(${pageViews.views}) desc`)
    .all();
}
