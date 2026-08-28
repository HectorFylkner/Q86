/**
 * The single source of price truth (ADR 0003). Nothing in the codebase may
 * write a price inline: the pricing page, the checkout session, the emails
 * and the receipts all read from here, so changing a number is one edit.
 *
 * Amounts are integer öre, never floats, and they are **VAT-inclusive** —
 * prisinformationslagen requires the price shown to a Swedish consumer to
 * be the price they pay. `vatBreakdown()` splits one out when a receipt or
 * an invoice needs the net.
 */

export const CURRENCY = "sek";

/**
 * Swedish standard rate, applied to Q86 as a business-to-consumer supply
 * of an electronically supplied service. This assumption is written down
 * in ADR 0003 rather than buried here, and Stripe Tax is authoritative at
 * checkout: a customer outside Sweden gets their own destination rate and
 * the displayed price is recomputed rather than assumed.
 */
export const VAT_RATE = 0.25;

export type PlanId = "free" | "monthly" | "sprint";

/** Everything the paywall can gate. */
export const FEATURES = [
  "learn",
  "drill",
  "patterns",
  "diagnostic",
  "timed",
  "queue",
  "deck",
  "analytics",
  "mastery",
  "decide",
  "plan",
  "coach",
  "import",
] as const;
export type Feature = (typeof FEATURES)[number];

/** Free without an account at all. */
export const PUBLIC_FEATURES: Feature[] = ["diagnostic"];

/**
 * What a free account gets. Deliberately generous on the things that make
 * Q86 worth trusting — all 24 lesson chapters, the pattern trainer, a real
 * daily drill allowance — and closed on the things that make it worth
 * paying for: timed sections, the spaced systems, and the analytics that
 * mirror the score report.
 */
const FREE_FEATURES: Feature[] = ["learn", "drill", "patterns", "diagnostic"];
const ALL_FEATURES: Feature[] = [...FEATURES];

/** Questions per calendar day on the free tier. Null means unlimited. */
export const FREE_DAILY_QUESTION_LIMIT = 10;

export type Plan = {
  id: PlanId;
  /** Swedish display name. */
  name: string;
  /** One line, on the pricing card. */
  tagline: string;
  /** VAT-inclusive, in öre. */
  priceOre: number;
  /** How the price is billed. */
  billing: "free" | "recurring_month" | "one_time";
  /** For fixed-length plans: how long the access lasts. */
  durationMonths: number | null;
  /** Environment variable holding this plan's Stripe price id. */
  priceIdEnv: string | null;
  features: Feature[];
  dailyQuestionLimit: number | null;
  /** Sales points, in Swedish, in the order they should be read. */
  bullets: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Gratis",
    tagline: "Läs allt, träna varje dag, se om metoden passar dig.",
    priceOre: 0,
    billing: "free",
    durationMonths: null,
    priceIdEnv: null,
    features: FREE_FEATURES,
    dailyQuestionLimit: FREE_DAILY_QUESTION_LIMIT,
    bullets: [
      "Alla 24 kapitel på svenska",
      `${FREE_DAILY_QUESTION_LIMIT} frågor per dag ur den verifierade banken`,
      "Mönsterträning utan begränsning",
      "Gratis diagnostiskt test med prognos",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Månad",
    tagline: "Hela plattformen, uppsägningsbar när som helst.",
    priceOre: 24_900,
    billing: "recurring_month",
    durationMonths: null,
    priceIdEnv: "STRIPE_PRICE_MONTHLY",
    features: ALL_FEATURES,
    dailyQuestionLimit: null,
    bullets: [
      "Obegränsat antal frågor",
      "Tidsatta set och full sektionssimulering med Review & Edit",
      "Repetitionskö, minneskort och mästerskapsstegar",
      "Analys i samma form som ditt riktiga score report",
      "Whiteboard-genomgång och import av score report",
    ],
  },
  sprint: {
    id: "sprint",
    name: "GMAT-sprint",
    tagline: "Tre månader, ett fast pris, inget som förnyas.",
    priceOre: 59_900,
    billing: "one_time",
    durationMonths: 3,
    priceIdEnv: "STRIPE_PRICE_SPRINT",
    features: ALL_FEATURES,
    dailyQuestionLimit: null,
    bullets: [
      "Allt i Månad, i tre månader",
      "Betalas en gång — ingen förnyelse att komma ihåg",
      "Motsvarar 200 kr/månad",
      "Passar dig som redan har ett bokat provdatum",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "monthly", "sprint"];

export function isPlanId(value: string): value is PlanId {
  return value === "free" || value === "monthly" || value === "sprint";
}

/** The Stripe price id for a paid plan, or null when unconfigured. */
export function stripePriceId(plan: PlanId): string | null {
  const key = PLANS[plan].priceIdEnv;
  if (!key) return null;
  return process.env[key] ?? null;
}

/** Reverse-lookup used by the webhook: which plan did Stripe just bill? */
export function planForPriceId(priceId: string): PlanId | null {
  for (const plan of PLAN_ORDER) {
    if (stripePriceId(plan) === priceId) return plan;
  }
  return null;
}

export type VatBreakdown = { grossOre: number; netOre: number; vatOre: number };

/** Splits a VAT-inclusive amount. Rounds the VAT, so net + vat === gross. */
export function vatBreakdown(grossOre: number): VatBreakdown {
  const vatOre = Math.round(grossOre - grossOre / (1 + VAT_RATE));
  return { grossOre, netOre: grossOre - vatOre, vatOre };
}

/** "249 kr", "599 kr", "0 kr" — sv-SE, no trailing decimals on whole kronor. */
export function formatPrice(ore: number, locale = "sv-SE"): string {
  const kronor = ore / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: Number.isInteger(kronor) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(kronor);
}

/** Effective monthly cost, for honest comparison on the pricing page. */
export function monthlyEquivalentOre(plan: Plan): number {
  if (plan.billing === "one_time" && plan.durationMonths) {
    return Math.round(plan.priceOre / plan.durationMonths);
  }
  return plan.priceOre;
}
