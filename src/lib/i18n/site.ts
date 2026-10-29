import type { LanguageCode } from "./dictionaries";
import { siteEn } from "./site.en";
import { siteHi } from "./site.hi";
import { siteGu } from "./site.gu";
import { siteMr } from "./site.mr";
import { siteTa } from "./site.ta";
import { siteTe } from "./site.te";
import { siteKn } from "./site.kn";

/**
 * Every word on the public homepage, per language. One typed shape, so a language that misses a
 * string is a compile error rather than a silently half-English page (the old homepage was ~8%
 * translated in every language but English).
 *
 * Written for a shopkeeper, not a developer: short sentences, no "Cloud API" / "webhook" / "attribution".
 * Hindi, Gujarati, Marathi, Tamil, Telugu and Kannada are first drafts written without a native
 * reviewer — read them with a fluent speaker before relying on them for a launch.
 */
export interface SiteCopy {
  meta: { title: string; description: string };
  nav: { how: string; pricing: string; faq: string; login: string; start: string };
  hero: {
    badge: string;
    titleA: string;
    titleB: string;
    sub: string;
    cta: string;
    ctaSecondary: string;
    note: string;
    languagesLabel: string;
  };
  chat: {
    shopName: string;
    example: string;
    delivered: string;
    caption: string;
    messages: Array<{ side: "in" | "out"; text: string }>;
  };
  jobs: { title: string; sub: string; items: Array<{ title: string; body: string; sample: string }> };
  steps: { title: string; sub: string; items: Array<{ title: string; body: string }> };
  trust: { title: string; items: Array<{ title: string; body: string }> };
  pricing: {
    title: string;
    sub: string;
    month: string;
    popular: string;
    cta: string;
    feeNote: string;
    /** "1 WhatsApp number" */
    numberOne: string;
    /** "Up to {n} WhatsApp numbers" */
    numberMany: string;
    /** "{n} AI images every month" */
    images: string;
    plans: Record<"starter" | "growth" | "scale", { blurb: string; features: string[] }>;
  };
  calc: {
    title: string;
    sub: string;
    promo: string;
    promoHint: string;
    service: string;
    serviceHint: string;
    plan: string;
    planRow: string;
    metaPromo: string;
    metaService: string;
    total: string;
    footnote: string;
    footnoteLink: string;
  };
  faq: { title: string; items: Array<{ q: string; a: string }> };
  final: { title: string; sub: string; cta: string };
  footer: { legal: string; changelog: string; privacy: string; terms: string; support: string };
}

const COPY: Record<LanguageCode, SiteCopy> = {
  en: siteEn, hi: siteHi, gu: siteGu, mr: siteMr, ta: siteTa, te: siteTe, kn: siteKn,
};

export function getSiteCopy(lang: LanguageCode): SiteCopy {
  return COPY[lang] ?? siteEn;
}

/** "Up to {n} WhatsApp numbers" → "Up to 5 WhatsApp numbers". */
export function fill(template: string, n: number): string {
  return template.replace("{n}", String(n));
}
