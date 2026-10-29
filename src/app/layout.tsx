import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Sans_Gujarati, Noto_Sans_Kannada, Noto_Sans_Tamil, Noto_Sans_Telugu } from "next/font/google";
import { CookieNotice } from "@/components/CookieNotice";
import { Analytics } from "@/components/Analytics";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getSiteCopy } from "@/lib/i18n/site";
import type { LanguageCode } from "@/lib/i18n/dictionaries";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-sk",
  subsets: ["latin"],
});

// Inter has no Indian-script glyphs, so every non-English page used to fall back to whatever font the
// visitor's phone happened to have. These are applied ONLY for the visitor's own language (below), and
// preload is off so no page downloads a script it is not showing: the browser fetches a font file only
// when the page actually contains characters from that script.
// next/font reads these options at build time, so each call must spell them out literally (no spread).
const devanagari = Noto_Sans_Devanagari({ variable: "--font-script", subsets: ["devanagari"], display: "swap", preload: false });
const gujarati = Noto_Sans_Gujarati({ variable: "--font-script", subsets: ["gujarati"], display: "swap", preload: false });
const tamil = Noto_Sans_Tamil({ variable: "--font-script", subsets: ["tamil"], display: "swap", preload: false });
const telugu = Noto_Sans_Telugu({ variable: "--font-script", subsets: ["telugu"], display: "swap", preload: false });
const kannada = Noto_Sans_Kannada({ variable: "--font-script", subsets: ["kannada"], display: "swap", preload: false });

const SCRIPT_FONTS: Partial<Record<LanguageCode, { variable: string }>> = {
  hi: devanagari,
  mr: devanagari,
  gu: gujarati,
  ta: tamil,
  te: telugu,
  kn: kannada,
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sendkar.shop";

// The title and description follow the visitor's language, so a Hindi visitor sees Hindi in the browser
// tab and in link previews, not an English tagline.
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getCurrentLanguage();
  const { title, description } = getSiteCopy(lang).meta;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: SITE_URL, siteName: "Sendkar", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getCurrentLanguage();
  const script = SCRIPT_FONTS[lang];

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${mono.variable} ${script ? script.variable : ""} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  );
}
