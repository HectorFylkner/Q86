import type { Metadata } from "next";
import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./globals.css";
import { BottomTabs, Nav } from "@/components/nav";
import { Providers } from "@/components/providers";

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
    "Concept-level GMAT Quant training with an explicit Data Sufficiency bridge.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Q86" },
  icons: { apple: "/apple-touch-icon.png" },
};

// Applied before hydration so a saved theme never flashes the wrong ground.
const themeInit = `try{var t=localStorage.getItem("q86-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <a
            href="#main-content"
            className="fixed left-4 top-[max(0.5rem,env(safe-area-inset-top))] z-[80] -translate-y-20 rounded-control bg-ink px-4 py-2 text-sm font-medium text-surface shadow-ambient transition-transform focus:translate-y-0"
          >
            Skip to main content
          </a>
          <div className="app-nav">
            <Nav />
            <BottomTabs />
          </div>
          <main
            id="main-content"
            tabIndex={-1}
            className="app-main mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:pb-16"
          >
            {children}
          </main>
          <footer className="app-footer mx-auto w-full max-w-[1200px] px-4 pb-24 sm:px-6 sm:pb-8">
            <p className="border-t border-grid pt-4 text-center text-[11px] text-graphite">
              Calibration comes from official GMAC material only. This
              platform trains; official mocks measure.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
