import type { Metadata } from "next";
import { FlagsCard } from "@/components/analytics/flags-card";
import { requireAdmin } from "@/lib/auth/session";
import { accountRows, counts, spendSummary } from "@/lib/ops/admin";
import { recentViews } from "@/lib/ops/analytics";
import { errorTrackingConfigured } from "@/lib/ops/errors";
import { transportConfigured } from "@/lib/email/transport";
import { stripeConfigured, stripeIsLive } from "@/lib/billing/stripe";
import { getI18n } from "@/lib/i18n/server";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

/**
 * The operator surface: what the deployment is configured to do, what it
 * has cost this month, who is on it, and what needs triaging.
 *
 * `requireAdmin()` is the gate. Every query below is cross-tenant by
 * definition — that is what an operator surface is — so this page must
 * never be reachable by anyone else, and the structural test checks it.
 */
export default async function AdminPage() {
  await requireAdmin();
  const { locale, t } = await getI18n();

  const [totals, spend, accounts, views] = await Promise.all([
    counts(),
    spendSummary(),
    accountRows(50),
    recentViews(30),
  ]);

  const config: Array<[string, boolean, string]> = [
    ["Stripe", stripeConfigured(), stripeIsLive() ? "live" : "test"],
    ["E-post", transportConfigured(), transportConfigured() ? "resend" : "log"],
    ["Felrapportering", errorTrackingConfigured(), errorTrackingConfigured() ? "sentry" : "log"],
    ["AI", Boolean(process.env.ANTHROPIC_API_KEY), ""],
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-semibold">{t("admin.title")}</h1>
        <p className="mt-1 text-sm text-graphite">{t("admin.lede")}</p>
      </div>

      <section>
        <h2 className="eyebrow">{t("admin.configTitle")}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {config.map(([label, on, note]) => (
            <li
              key={label}
              className="rounded-control border border-grid bg-surface px-3 py-1.5 text-sm"
            >
              <span aria-hidden className={on ? "text-ballpoint" : "text-amber"}>
                {on ? "●" : "○"}
              </span>{" "}
              {label}
              {note && <span className="ml-1.5 font-mono text-xs text-graphite">{note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="eyebrow">{t("admin.countsTitle")}</h2>
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-grid bg-grid sm:grid-cols-4 lg:grid-cols-7">
          {(
            [
              [totals.accounts, t("admin.accounts")],
              [totals.paid, t("admin.paid")],
              [totals.granted, t("admin.granted")],
              [totals.openFlags, t("admin.openFlags")],
              [totals.bankVerified, t("admin.bankVerified")],
              [totals.bankRetired, t("admin.bankRetired")],
              [totals.emailsThisWeek, t("admin.emailsWeek")],
            ] as const
          ).map(([value, label]) => (
            <div key={label} className="bg-paper px-4 py-4">
              <dd className="font-display text-2xl font-bold">
                {formatNumber(value, locale)}
              </dd>
              <dt className="mt-0.5 text-xs text-graphite">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="eyebrow">
          {t("admin.spendTitle", { month: spend.month })}
        </h2>
        <p className="mt-2 text-sm">
          {t("admin.spendOf", {
            spent: formatCurrency(spend.totalOre, locale),
            cap: formatCurrency(spend.capOre, locale),
          })}
        </p>
        <div className="mt-2 h-2 w-full max-w-[28rem] rounded-full bg-grid">
          <div
            className={
              spend.totalOre / spend.capOre > 0.8
                ? "h-2 rounded-full bg-redpen"
                : "h-2 rounded-full bg-ink"
            }
            style={{
              width: `${Math.min(100, (spend.totalOre / Math.max(1, spend.capOre)) * 100)}%`,
            }}
          />
        </div>
        {spend.byRoute.length > 0 && (
          <table className="mt-4 w-full max-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-grid text-left">
                <th className="py-1.5 font-mono text-[11px] uppercase text-graphite">
                  {t("admin.route")}
                </th>
                <th className="py-1.5 text-right font-mono text-[11px] uppercase text-graphite">
                  {t("admin.calls")}
                </th>
                <th className="py-1.5 text-right font-mono text-[11px] uppercase text-graphite">
                  {t("admin.failed")}
                </th>
                <th className="py-1.5 text-right font-mono text-[11px] uppercase text-graphite">
                  {t("admin.cost")}
                </th>
              </tr>
            </thead>
            <tbody>
              {spend.byRoute.map((row) => (
                <tr key={row.route} className="border-b border-grid">
                  <td className="py-1.5 font-mono text-xs">{row.route}</td>
                  <td className="py-1.5 text-right font-mono text-xs">
                    {row.calls}
                  </td>
                  <td className="py-1.5 text-right font-mono text-xs">
                    {row.failed}
                  </td>
                  <td className="py-1.5 text-right font-mono text-xs">
                    {formatCurrency(row.ore, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <FlagsCard />

      <section>
        <h2 className="eyebrow">{t("admin.accountsTitle")}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-grid text-left">
                {[
                  t("admin.account"),
                  t("admin.created"),
                  t("admin.plan"),
                  t("admin.until"),
                  t("admin.attempts"),
                  t("admin.cost"),
                ].map((heading) => (
                  <th
                    key={heading}
                    className="py-1.5 font-mono text-[11px] uppercase text-graphite"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((row) => (
                <tr key={row.id} className="border-b border-grid">
                  <td className="py-1.5">
                    {row.email}
                    {row.role === "admin" && (
                      <span className="ml-2 rounded-control bg-highlight px-1.5 py-0.5 font-mono text-[10px] uppercase">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 font-mono text-xs text-graphite">
                    {formatDate(row.createdAt, locale)}
                  </td>
                  <td className="py-1.5 font-mono text-xs">
                    {row.grantedUntil
                      ? t("admin.viaGrant")
                      : `${row.plan ?? "free"} ${row.status ?? ""}`.trim()}
                  </td>
                  <td className="py-1.5 font-mono text-xs text-graphite">
                    {row.grantedUntil
                      ? formatDate(row.grantedUntil, locale)
                      : row.currentPeriodEnd
                        ? formatDate(row.currentPeriodEnd, locale)
                        : "—"}
                  </td>
                  <td className="py-1.5 font-mono text-xs">{row.attempts}</td>
                  <td className="py-1.5 font-mono text-xs">
                    {formatCurrency(row.spendOre, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="eyebrow">{t("admin.viewsTitle")}</h2>
        <p className="mt-2 max-w-[60ch] text-xs text-graphite">
          {t("admin.viewsNote")}
        </p>
        <ul className="mt-3 max-w-[28rem] space-y-1">
          {views.map((row) => (
            <li
              key={row.path}
              className="flex justify-between border-b border-grid py-1 font-mono text-xs"
            >
              <span>{row.path}</span>
              <span>{formatNumber(row.views, locale)}</span>
            </li>
          ))}
          {views.length === 0 && (
            <li className="text-sm text-graphite">{t("admin.viewsEmpty")}</li>
          )}
        </ul>
      </section>
    </div>
  );
}
