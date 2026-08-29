import { BottomTabs, Nav } from "@/components/nav";
import { currentUser } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/server";

/**
 * The signed-in application: fixed measure, persistent navigation, the
 * thumb-reachable tab bar on phones.
 *
 * `currentUser()` here is for chrome, not authorization — every page below
 * still gates for itself (ADR 0002, and tests/unit/paywall-structure.test.ts
 * makes forgetting one a failing test).
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  const t = await getT();

  return (
    <>
      {user && (
        <>
          <Nav userEmail={user.email} />
          <BottomTabs />
        </>
      )}
      <main className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-6 sm:px-6 sm:pb-16">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[1120px] px-4 pb-24 sm:px-6 sm:pb-8">
        <p className="border-t border-grid pt-4 text-center text-[11px] text-graphite">
          {t("footer.disclaimer")}
        </p>
      </footer>
    </>
  );
}
