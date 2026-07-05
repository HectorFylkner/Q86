import type { Metadata } from "next";
import localFont from "next/font/local";
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
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Q86" },
  icons: { apple: "/apple-touch-icon.png" },
};

// Applied before hydration so a saved theme never flashes the wrong ground.
const themeInit = `try{var t=localStorage.getItem("q86-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <Nav />
          <BottomTabs />
          <main className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-6 sm:px-6 sm:pb-16">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-[1120px] px-4 pb-24 sm:px-6 sm:pb-8">
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
