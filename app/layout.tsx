import type { Metadata } from "next";
import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/components/i18n-provider";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import { SITE_ORIGIN } from "@/lib/site";

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

const DESCRIPTION =
  "Svensk GMAT-förberedelse för Quantitative Reasoning: verifierade frågor " +
  "på engelska, undervisning och felanalys på svenska, och en dagsplan som " +
  "räknas fram ur dina egna misstag.";

export const metadata: Metadata = {
  // Every page's own `alternates.canonical` and Open Graph URL resolve
  // against this, so one environment variable moves the whole site.
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Q86 — GMAT-förberedelse för kvantdelen",
    template: "%s · Q86",
  },
  description: DESCRIPTION,
  applicationName: "Q86",
  keywords: [
    "GMAT förberedelse",
    "GMAT quant",
    "GMAT Focus",
    "plugga inför GMAT",
    "GMAT kvantdel",
    "Handelshögskolan GMAT",
    "GMAT vs Högskoleprovet",
  ],
  openGraph: {
    type: "website",
    locale: "sv_SE",
    alternateLocale: "en_GB",
    siteName: "Q86",
    title: "Q86 — GMAT-förberedelse för kvantdelen",
    description: DESCRIPTION,
    url: SITE_ORIGIN,
  },
  twitter: {
    card: "summary_large_image",
    title: "Q86 — GMAT-förberedelse för kvantdelen",
    description: DESCRIPTION,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Q86" },
  icons: { apple: "/apple-touch-icon.png" },
};

// Applied before hydration so a saved theme never flashes the wrong ground.
const themeInit = `try{var t=localStorage.getItem("q86-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Nothing but the ground and the providers. The signed-in application,
  // the public site and the credential screens each bring their own
  // chrome, because a marketing page wants full-bleed sections and the
  // app wants a fixed measure.
  const locale = await getLocale();

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
            {children}
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
