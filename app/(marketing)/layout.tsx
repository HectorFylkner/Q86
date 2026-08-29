import { CookieBanner } from "@/components/site/cookie-consent";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { headers } from "next/headers";
import { currentUser } from "@/lib/auth/session";
import { countView } from "@/lib/ops/analytics";
import { PATH_HEADER } from "@/middleware";

/**
 * The public site: editorial ground, hairline rules, full-bleed sections.
 *
 * `currentUser()` is used for one thing only — pointing the header's
 * button at the app instead of at a login form for someone who is already
 * signed in. Nothing here is gated.
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();

  // A cookieless aggregate count, incremented here because this layout is
  // the one thing every public page passes through. It stores no
  // identifier at all, which is why it needs no consent and keeps working
  // when someone declines the banner (ADR 0007).
  const path = (await headers()).get(PATH_HEADER) ?? null;
  if (path) await countView(path);

  return (
    <div className="editorial min-h-screen">
      <SiteHeader signedIn={Boolean(user)} />
      <main>{children}</main>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}
