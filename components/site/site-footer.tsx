import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { SUPPORT_EMAIL } from "@/lib/site";
import { CookieSettingsButton } from "./cookie-consent";

/**
 * The public footer. Carries the two things Swedish e-commerce law expects
 * to be reachable from every page — the terms and the withdrawal
 * information — and the GMAC disclaimer, which belongs on every public
 * page rather than only on the landing page.
 */
export async function SiteFooter() {
  const t = await getT();

  const columns: Array<{ heading: string; links: Array<[string, string]> }> = [
    {
      heading: t("site.footer.product"),
      links: [
        ["/priser", t("site.nav.pricing")],
        ["/diagnos", t("site.nav.diagnostic")],
        ["/login", t("site.nav.signIn")],
      ],
    },
    {
      heading: t("site.footer.resources"),
      links: [["/guider", t("site.nav.guides")]],
    },
    {
      heading: t("site.footer.legal"),
      links: [
        ["/integritetspolicy", t("site.footer.privacy")],
        ["/kopvillkor", t("site.footer.terms")],
        ["/angerratt", t("site.footer.withdrawal")],
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-grid">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-bold tracking-tight">Q86</p>
            <p className="mt-2 max-w-[24ch] text-sm text-graphite">
              {t("nav.tagline")}
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.heading}>
              <p className="eyebrow">{column.heading}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-graphite transition-colors hover:text-ink"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-grid pt-6">
          <p className="text-sm text-graphite">
            {t("site.footer.contactBody", { email: SUPPORT_EMAIL })}
          </p>
          <p className="mt-3 max-w-[70ch] text-[11px] leading-relaxed text-graphite">
            {t("footer.disclaimer")}
          </p>
          <div className="mt-4">
            <CookieSettingsButton label={t("cookies.settings")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
