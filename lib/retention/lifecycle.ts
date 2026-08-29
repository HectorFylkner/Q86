import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { emailLog, subscriptions, users } from "../db/schema.ts";
import { sendEmail } from "../email/send.ts";
import { translator, type Key, type Translate } from "../i18n/index.ts";
import { formatDate, formatPercent } from "../i18n/format.ts";
import { skillLabel } from "../i18n/labels.ts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../i18n/types.ts";
import { absoluteUrl } from "../site.ts";
import { activeGrant } from "./grants.ts";
import {
  attemptStreak,
  daysBetween,
  testDateFor,
  weekSummary,
} from "./activity.ts";

/**
 * The lifecycle messages and the dispatcher that decides who gets them.
 *
 * Two rules shape everything here.
 *
 * **Idempotency is the primary key.** Every send writes
 * `<userId>:<kind>:<window>` into `email_log` first; a second run in the
 * same window conflicts and skips. The dispatcher can therefore be run
 * hourly, twice by accident, or replayed after a crash, without anyone
 * receiving a duplicate — the same shape as the Stripe event ledger.
 *
 * **A message must be worth sending.** Each rule below has a condition
 * that excludes the case where the message would be noise: no weekly
 * summary for a week with no attempts, no streak-recovery note to someone
 * who never had a streak, no "ending soon" to an account that already
 * renewed.
 */

export type EmailKind =
  | "welcome"
  | "ending_soon"
  | "streak_recovery"
  | "weekly";

export type Dispatch = {
  userId: string;
  kind: EmailKind;
  window: string;
  to: string;
};

const DAY = 86_400_000;

/** Days before a period ends that the warning goes out. */
export const ENDING_SOON_DAYS = 3;
/** A streak worth mourning. Below this, silence is the kinder message. */
export const STREAK_FLOOR = 3;

/** ISO week, so a weekly digest has one window per calendar week. */
export function isoWeek(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // Thursday of the current week decides the year, per ISO 8601.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / DAY + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Claim the right to send. Returns false when this message already went
 * out for this window, which is how every rule below stays idempotent.
 */
async function claim(
  userId: string,
  kind: EmailKind,
  window: string,
): Promise<boolean> {
  const rows = await db
    .insert(emailLog)
    .values({ id: `${userId}:${kind}:${window}`, userId, kind, window })
    .onConflictDoNothing()
    .returning({ id: emailLog.id });
  return rows.length > 0;
}

function localeOf(value: string | null): Locale {
  return isLocale(value ?? "") ? (value as Locale) : DEFAULT_LOCALE;
}

/** " Anna" or "" — the leading space belongs to the greeting, not the name. */
function greetingName(name: string | null): string {
  const trimmed = (name ?? "").trim();
  return trimmed.length > 0 ? ` ${trimmed.split(/\s+/)[0]}` : "";
}

function compose(
  t: Translate,
  subject: string,
  body: string,
  transactional: boolean,
): { subject: string; text: string } {
  const footer = transactional
    ? t("email.footerNoOptOut")
    : t("email.footer", { settingsUrl: absoluteUrl("/konto") });
  return {
    subject,
    text: `${body}\n\n${t("email.signOff")}\n\n—\n${footer}\n`,
  };
}

type Candidate = {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  createdAt: Date;
  onboardedAt: Date | null;
};

async function everyAccount(): Promise<Candidate[]> {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      locale: users.locale,
      createdAt: users.createdAt,
      onboardedAt: users.onboardedAt,
    })
    .from(users)
    .all();
}

/**
 * One pass. Returns what it sent, so the operator script can print it and
 * a test can assert on it without reading the mailbox.
 */
export async function runLifecycleEmails(
  now: Date = new Date(),
): Promise<Dispatch[]> {
  const sent: Dispatch[] = [];
  const accounts = await everyAccount();

  for (const account of accounts) {
    const t = translator(localeOf(account.locale));
    const locale = localeOf(account.locale);
    const name = greetingName(account.name);

    // ---- Welcome: once, on the account's first day ---------------------
    if (now.getTime() - account.createdAt.getTime() < DAY) {
      if (await claim(account.id, "welcome", "once")) {
        const message = compose(
          t,
          t("email.welcome.subject"),
          t("email.welcome.body", {
            name,
            onboardingUrl: absoluteUrl("/valkommen"),
          }),
          true,
        );
        await sendEmail({ to: account.email, ...message });
        sent.push({
          userId: account.id,
          kind: "welcome",
          window: "once",
          to: account.email,
        });
      }
    }

    // ---- Ending soon: a paid period or a grant about to lapse ----------
    const subscription = await db
      .select({
        plan: subscriptions.plan,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, account.id))
      .get();
    const grant = await activeGrant(account.id, now);

    // Only warn about an access window that will actually close: a
    // renewing subscription is not ending, so it gets no warning.
    const closing =
      subscription &&
      subscription.plan !== "free" &&
      subscription.currentPeriodEnd &&
      (subscription.cancelAtPeriodEnd || subscription.plan === "sprint")
        ? {
            when: subscription.currentPeriodEnd,
            planName: t(`billing.plans.${subscription.plan}.name` as Key),
          }
        : grant
          ? {
              when: grant.expiresAt,
              planName: t(`billing.plans.${grant.plan}.name` as Key),
            }
          : null;

    if (closing) {
      const daysLeft = daysBetween(now, closing.when);
      if (daysLeft > 0 && daysLeft <= ENDING_SOON_DAYS) {
        const window = isoDay(closing.when);
        if (await claim(account.id, "ending_soon", window)) {
          const message = compose(
            t,
            t("email.endingSoon.subject", { days: daysLeft }),
            t("email.endingSoon.body", {
              name,
              planName: closing.planName,
              date: formatDate(closing.when, locale),
              accountUrl: absoluteUrl("/konto"),
            }),
            true,
          );
          await sendEmail({ to: account.email, ...message });
          sent.push({
            userId: account.id,
            kind: "ending_soon",
            window,
            to: account.email,
          });
        }
      }
    }

    // ---- Streak recovery: a real streak that ended yesterday -----------
    const yesterday = new Date(now.getTime() - DAY);
    const streakToYesterday = await attemptStreak(account.id, yesterday);
    const streakToToday = await attemptStreak(account.id, now);
    // The streak ran up to the day before yesterday and stopped: nothing
    // yesterday, nothing today. Someone mid-session today is left alone.
    if (streakToToday === 0 && streakToYesterday === 0) {
      const dayBefore = new Date(now.getTime() - 2 * DAY);
      const broken = await attemptStreak(account.id, dayBefore);
      if (broken >= STREAK_FLOOR) {
        const window = isoDay(now);
        if (await claim(account.id, "streak_recovery", window)) {
          const message = compose(
            t,
            t("email.streakRecovery.subject", { streak: broken }),
            t("email.streakRecovery.body", {
              name,
              streak: broken,
              queueUrl: absoluteUrl("/queue"),
            }),
            false,
          );
          await sendEmail({ to: account.email, ...message });
          sent.push({
            userId: account.id,
            kind: "streak_recovery",
            window,
            to: account.email,
          });
        }
      }
    }

    // ---- Weekly progress: only for a week that happened ----------------
    const week = await weekSummary(account.id, now);
    if (week.attempts > 0) {
      const window = isoWeek(now);
      if (await claim(account.id, "weekly", window)) {
        const testDate = await testDateFor(account.id);
        const accuracy = formatPercent(week.correct / week.attempts, locale);
        const weakestLine = week.weakestSkill
          ? t("email.weekly.weakest", {
              skill: skillLabel(t, week.weakestSkill),
            })
          : t("email.weekly.weakestNone");
        const testDateLine = testDate
          ? t("email.weekly.testDate", {
              days: Math.max(0, daysBetween(now, testDate)),
            })
          : t("email.weekly.testDateNone", {
              settingsUrl: absoluteUrl("/idag"),
            });
        const message = compose(
          t,
          t("email.weekly.subject", { attempts: week.attempts, accuracy }),
          t("email.weekly.body", {
            name,
            attempts: week.attempts,
            accuracy,
            days: week.days,
            reviewed: week.reviewed,
            weakestLine,
            testDateLine,
            todayUrl: absoluteUrl("/idag"),
          }),
          false,
        );
        await sendEmail({ to: account.email, ...message });
        sent.push({
          userId: account.id,
          kind: "weekly",
          window,
          to: account.email,
        });
      }
    }
  }

  return sent;
}

/** Referral notice, sent from signup rather than from the dispatcher —
 *  it is a reaction to an event, not a scheduled sweep. */
export async function sendReferralNotice(
  inviterId: string,
  inviteeName: string,
  days: number,
): Promise<void> {
  const inviter = await db
    .select({ email: users.email, locale: users.locale })
    .from(users)
    .where(eq(users.id, inviterId))
    .get();
  if (!inviter) return;
  const t = translator(localeOf(inviter.locale));
  const message = compose(
    t,
    t("email.referral.subject", { name: inviteeName }),
    t("email.referral.body", { days, accountUrl: absoluteUrl("/konto") }),
    true,
  );
  await sendEmail({ to: inviter.email, ...message });
}
