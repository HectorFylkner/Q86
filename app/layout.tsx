import type { Metadata } from "next";
import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./globals.css";
import { BottomTabs, Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import { currentUser } from "@/lib/auth/session";
import { I18nProvider } from "@/components/i18n-provider";
import { getDictionary, translator } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";

const inter = localFont({
  src: "./fonts/inter-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-var.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-var.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Q86",
  description:
    "Svensk GMAT-förberedelse för Quantitative Reasoning: verifierade frågor, " +
    "svensk undervisning och analys i score report-form.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Q86" },
  icons: { apple: "/apple-touch-icon.png" },
};

// Applied before hydration so a saved theme never flashes the wrong ground.
const themeInit = `try{var t=localStorage.getItem("q86-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The app chrome belongs to a signed-in session. Credential screens (and,
  // from M4, the public site) render on the bare paper ground instead.
  const user = await currentUser();
  const locale = await getLocale();
  const t = translator(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <I18nProvider locale={locale} dictionary={getDictionary(locale)}>
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
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
