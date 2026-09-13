import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CookieNotice } from "@/components/CookieNotice";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-sk",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sendkar.shop";
const TITLE = "Sendkar — WhatsApp Marketing & AI Automation Platform";
const DESCRIPTION = "WhatsApp marketing, AI-powered automations, a shared team inbox, and revenue attribution — built on Meta's real Cloud API, not a reseller.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Sendkar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  );
}
