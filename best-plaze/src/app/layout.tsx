import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fontDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "XI BestPlaze — Lounge Tours",
    template: "%s · XI BestPlaze",
  },
  description:
    "Bar lounge à Tours. Cocktails, concerts, terrasse. Réservez votre soirée.",
  applicationName: "XI BestPlaze",
};

export const viewport: Viewport = {
  themeColor: "#070709",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fontBody.variable} ${fontDisplay.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bp-bg text-bp-text font-sans">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0e0e12",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#e8e6e1",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
