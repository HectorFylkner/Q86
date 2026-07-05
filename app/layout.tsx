import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "katex/dist/katex.min.css";
import "./globals.css";
import { BottomTabs, Nav } from "@/components/nav";
import { Providers } from "@/components/providers";

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
  description: "Personal GMAT Focus quant training platform",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Q86",
  },
  icons: { apple: "/apple-touch-icon.png" },
};

// The OS chrome matches whichever ground the desk is showing.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#141519" },
  ],
  viewportFit: "cover",
};

// Applied before hydration so a saved theme never flashes the wrong ground.
const themeInit = `try{var t=localStorage.getItem("q86-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

/** Mirrors the middleware gate: the authenticated shell (nav, tabs,
 *  footer) stays off the page until the visitor is actually in. */
async function isAuthed(): Promise<boolean> {
  const password = process.env.SITE_PASSWORD;
  if (!password) return true;
  const presented = (await cookies()).get("q86_auth")?.value;
  if (!presented) return false;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return presented === hex;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authed = await isAuthed();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          {authed && <Nav />}
          {authed && <BottomTabs />}
          <main className="mx-auto w-full max-w-shell px-4 pb-24 pt-6 sm:px-6 sm:pb-16">
            {children}
          </main>
          {authed && (
            <footer className="mx-auto w-full max-w-shell px-4 pb-24 sm:px-6 sm:pb-8">
              <p className="border-t border-grid pt-4 text-center text-caption text-graphite">
                Calibration comes from official GMAC material only. This
                platform trains; official mocks measure.
              </p>
            </footer>
          )}
        </Providers>
      </body>
    </html>
  );
}
