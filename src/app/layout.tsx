import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CookieNotice } from "@/components/CookieNotice";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-sk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sendkar — WhatsApp Marketing Software for Indian Sellers",
  description: "WhatsApp Marketing, bulk broadcasts, a shared team inbox, and revenue tracking — built on Meta's real Cloud API, not a reseller.",
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
      </body>
    </html>
  );
}
