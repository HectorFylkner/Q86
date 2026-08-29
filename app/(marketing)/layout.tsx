import { CookieBanner } from "@/components/site/cookie-consent";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { currentUser } from "@/lib/auth/session";

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

  return (
    <div className="editorial min-h-screen">
      <SiteHeader signedIn={Boolean(user)} />
      <main>{children}</main>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}
