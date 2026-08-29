/**
 * The referral terms, in a module with no imports at all.
 *
 * They live apart from `./grants.ts` because the signup form needs the
 * number and `grants.ts` reaches the database and `node:crypto`. A client
 * component importing that file drags the whole server module into the
 * browser bundle, which is a build failure rather than a subtlety — see
 * the module-boundary rules in tests/unit/i18n.test.ts.
 */

/** Days each side gets when a referral converts. One number, one place. */
export const REFERRAL_DAYS = 14;

/** What a referral grant unlocks. Monthly is the honest choice: the sprint
 *  plan is a fixed window someone paid for, not a reward tier. */
export const REFERRAL_PLAN = "monthly" as const;
