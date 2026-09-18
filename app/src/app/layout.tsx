import type { Metadata, Viewport } from "next";
import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KoylaNiti",
  description: "SIH26024 - AI-Based Smart Governance and Compliance Monitoring System for Coal Mines",
  manifest: "/manifest.json",
  icons: {
    icon: ["/icon-192.png", "/icon-512.png"],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#362418",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale === "hi" ? "hi" : "en"}
      className={`${publicSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-[15px]">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
