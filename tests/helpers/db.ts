import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "@/lib/db";
import { questions, subscriptions } from "@/lib/db/schema";
import { createUser } from "@/lib/auth/users";
import { createSession, SESSION_COOKIE } from "@/lib/auth/session";
import { __clearCookies, __setCookie } from "./next-headers";

/**
 * A real, migrated database plus a handful of bank questions — enough for
 * the drill, timed, deck and pattern paths to run for real. Nothing here
 * stubs the data layer: a tenant-isolation test that mocks the database
 * proves only that the mock is isolated.
 */
export async function migrateTestDb(): Promise<void> {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
}

/** Nine verified questions spanning the four fundamental skills —
 *  enough problem-solving items for a 7-question mini timed set. */
export async function seedQuestions(): Promise<number[]> {
  const rows: Array<typeof questions.$inferInsert> = [
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "arithmetic",
      context: "pure",
      fundamentalSkill: "value_order_factors",
      subtopic: "prime_factorization",
      difficulty: 3,
      stemMd: "How many positive divisors does 72 have?",
      choices: ["6", "8", "10", "12", "14"],
      correctIndex: 3,
      solutionMd:
        "72 = 2^3 * 3^2.\n\n**Trigger cue**\n\nDivisor count asked.\n\n**Takeaway**\n\nAdd one to each exponent, then multiply.",
      fastestPathMd: "(3+1)(2+1) = 12.",
      trapMap: { "0": "forgot the +1" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "algebra",
      context: "pure",
      fundamentalSkill: "equal_unequal_alg",
      subtopic: "linear_systems",
      difficulty: 2,
      stemMd: "If 2x + 3 = 11, what is x?",
      choices: ["2", "3", "4", "5", "6"],
      correctIndex: 2,
      solutionMd:
        "2x = 8.\n\n**Trigger cue**\n\nOne linear equation.\n\n**Takeaway**\n\nIsolate, then divide.",
      fastestPathMd: "x = 4.",
      trapMap: { "1": "divided before subtracting" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "arithmetic",
      context: "real",
      fundamentalSkill: "rates_ratio_percent",
      subtopic: "percent_change_chains",
      difficulty: 4,
      stemMd: "A price rises 20% then falls 20%. Net change?",
      choices: ["-4%", "0%", "+4%", "-2%", "+2%"],
      correctIndex: 0,
      solutionMd:
        "1.2 * 0.8 = 0.96.\n\n**Trigger cue**\n\nSuccessive percent moves.\n\n**Takeaway**\n\nMultiply factors; never add percents.",
      fastestPathMd: "0.96 → -4%.",
      trapMap: { "1": "added the percents" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "arithmetic",
      context: "pure",
      fundamentalSkill: "counting_sets_series_prob_stats",
      subtopic: "probability",
      difficulty: 3,
      stemMd: "Two fair coins. P(exactly one head)?",
      choices: ["1/4", "1/3", "1/2", "2/3", "3/4"],
      correctIndex: 2,
      solutionMd:
        "HT and TH out of four.\n\n**Trigger cue**\n\nExactly-one wording.\n\n**Takeaway**\n\nEnumerate the sample space when it is tiny.",
      fastestPathMd: "2/4 = 1/2.",
      trapMap: { "0": "counted only HT" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "algebra",
      context: "pure",
      fundamentalSkill: "equal_unequal_alg",
      subtopic: "quadratics_factoring",
      difficulty: 3,
      stemMd: "If x^2 - 5x + 6 = 0, what is the sum of the roots?",
      choices: ["2", "3", "5", "6", "-5"],
      correctIndex: 2,
      solutionMd:
        "Sum is 5.\n\n**Trigger cue**\n\nSum or product of roots.\n\n**Takeaway**\n\nSum = -b/a without solving.",
      fastestPathMd: "-(-5)/1 = 5.",
      trapMap: { "3": "gave the product" },
      verified: true,
    },
    {
      source: "seed",
      format: "data_sufficiency",
      contentDomain: "arithmetic",
      context: "pure",
      fundamentalSkill: "value_order_factors",
      subtopic: "divisibility_gcf_lcm",
      difficulty: 4,
      stemMd: "Is the integer n divisible by 6?",
      choices: [
        "Statement (1) ALONE is sufficient, but statement (2) alone is not.",
        "Statement (2) ALONE is sufficient, but statement (1) alone is not.",
        "BOTH statements TOGETHER are sufficient, but NEITHER ALONE is.",
        "EACH statement ALONE is sufficient.",
        "Statements (1) and (2) TOGETHER are NOT sufficient.",
      ],
      correctIndex: 2,
      solutionMd:
        "Need both 2 and 3.\n\n**Trigger cue**\n\nDivisibility by a composite.\n\n**Takeaway**\n\nSplit the modulus into coprime factors.",
      fastestPathMd: "2 and 3 together give 6.",
      trapMap: { "3": "treated each factor as enough" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "arithmetic",
      context: "pure",
      fundamentalSkill: "value_order_factors",
      subtopic: "remainders_units_digits",
      difficulty: 3,
      stemMd: "What is the units digit of 7^23?",
      choices: ["1", "3", "7", "9", "5"],
      correctIndex: 1,
      solutionMd:
        "The cycle is 7, 9, 3, 1.\n\n**Trigger cue**\n\nLarge power, units digit only.\n\n**Takeaway**\n\nFind the cycle length, then take the exponent mod it.",
      fastestPathMd: "23 mod 4 = 3 → third term, 3.",
      trapMap: { "2": "used the exponent directly" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "arithmetic",
      context: "real",
      fundamentalSkill: "rates_ratio_percent",
      subtopic: "rates_speed_work",
      difficulty: 3,
      stemMd: "A train covers 180 km in 2.5 hours. Average speed in km/h?",
      choices: ["68", "70", "72", "75", "80"],
      correctIndex: 2,
      solutionMd:
        "180 / 2.5 = 72.\n\n**Trigger cue**\n\nDistance and time given.\n\n**Takeaway**\n\nDivide before rounding, never after.",
      fastestPathMd: "180/2.5 = 72.",
      trapMap: { "3": "rounded 2.5 down to 2" },
      verified: true,
    },
    {
      source: "seed",
      format: "problem_solving",
      contentDomain: "arithmetic",
      context: "pure",
      fundamentalSkill: "counting_sets_series_prob_stats",
      subtopic: "statistics_mean_median_sd",
      difficulty: 2,
      stemMd: "What is the median of 3, 9, 4, 1, 7?",
      choices: ["3", "4", "5", "7", "9"],
      correctIndex: 1,
      solutionMd:
        "Sorted: 1, 3, 4, 7, 9.\n\n**Trigger cue**\n\nMedian of an unsorted list.\n\n**Takeaway**\n\nSort first; the median is positional, not arithmetic.",
      fastestPathMd: "Middle of five is 4.",
      trapMap: { "2": "computed the mean" },
      verified: true,
    },
  ];
  const inserted = await db.insert(questions).values(rows).returning().all();
  return inserted.map((q) => q.id);
}

export type TestAccount = { id: string; email: string; token: string };

/**
 * Put an account on a paid plan without going through Stripe. Tests about
 * tenant isolation should not also be tests about billing: they need an
 * account that can reach every feature, so the isolation they assert is
 * across the whole data surface rather than across the free subset.
 */
export async function grantPaidPlan(
  userId: string,
  plan: "monthly" | "sprint" = "monthly",
): Promise<void> {
  const values = {
    userId,
    plan,
    status: "active" as const,
    currentPeriodEnd: new Date(Date.now() + 365 * 86_400_000),
    cancelAtPeriodEnd: false,
    updatedAt: new Date(),
  };
  await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({ target: subscriptions.userId, set: values })
    .run();
}

export async function makeAccount(
  email: string,
  role: "user" | "admin" = "user",
): Promise<TestAccount> {
  const user = await createUser({
    email,
    password: "test-password-1234",
    role,
    emailVerified: true,
  });
  const token = await createSession(user.id);
  return { id: user.id, email: user.email, token };
}

/** An account that can reach every feature. */
export async function makePaidAccount(
  email: string,
  role: "user" | "admin" = "user",
): Promise<TestAccount> {
  const account = await makeAccount(email, role);
  await grantPaidPlan(account.id);
  return account;
}

/** Make subsequent server-action calls run as this account. */
export function asUser(account: TestAccount): void {
  __setCookie(SESSION_COOKIE, account.token);
}

export function signOut(): void {
  __clearCookies();
}
