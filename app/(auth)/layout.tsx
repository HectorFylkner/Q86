/**
 * The credential screens sit on the bare paper ground. `AuthShell` is the
 * whole frame — no application navigation (there is no session yet) and no
 * marketing navigation (nothing should compete with the form).
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="px-4 pb-24 sm:px-6">{children}</main>;
}
