import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { BillCalculator } from "@/components/BillCalculator";
import { PhoneChat } from "@/components/site/PhoneChat";
import { LanguageChips } from "@/components/site/LanguageChips";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { fill, getSiteCopy } from "@/lib/i18n/site";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// One icon per job, in the same order as the copy: offers, getting paid, thank-yous, never missing a customer.
const JOB_ICONS = [
  <svg key="offer" viewBox="0 0 24 24" width="24" height="24" {...stroke}><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z" /><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" /></svg>,
  <svg key="paid" viewBox="0 0 24 24" width="24" height="24" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M9 8h6M9 11h6M9 8c3.2 0 4.2 1.4 4.2 3s-1 3-4.2 3l4 3" /></svg>,
  <svg key="thanks" viewBox="0 0 24 24" width="24" height="24" {...stroke}><path d="M12 20.5s-7.5-4.6-9.4-9.3A5.2 5.2 0 0112 6.6a5.2 5.2 0 019.4 4.6c-1.9 4.7-9.4 9.3-9.4 9.3z" /></svg>,
  <svg key="chat" viewBox="0 0 24 24" width="24" height="24" {...stroke}><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>,
];

const Check = () => (
  <span className="sk-site-check" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="13" height="13" {...stroke} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  </span>
);

const PLAN_ORDER = ["starter", "growth", "scale"] as const;
const PLAN_NAMES: Record<(typeof PLAN_ORDER)[number], string> = { starter: "Starter", growth: "Growth", scale: "Scale" };

export default async function RootPage() {
  // A logged-in visitor never actually reaches this page: proxy.ts redirects them to /dashboard first.
  const lang = await getCurrentLanguage();
  const t = getSiteCopy(lang);

  return (
    <div className="flex-1 overflow-x-hidden">
      <header className="sk-site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Sendkar">
            <Logo />
            <span className="whitespace-nowrap text-[16px] font-semibold tracking-tight">Sendkar</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <a href="#how" className="hidden whitespace-nowrap text-[14.5px] text-muted hover:text-foreground md:inline">{t.nav.how}</a>
            <a href="#pricing" className="hidden whitespace-nowrap text-[14.5px] text-muted hover:text-foreground md:inline">{t.nav.pricing}</a>
            <a href="#faq" className="hidden whitespace-nowrap text-[14.5px] text-muted hover:text-foreground md:inline">{t.nav.faq}</a>
            <div className="hidden md:block"><LanguageSwitcher current={lang} compact /></div>
            <Link href="/login" prefetch={false} className="hidden whitespace-nowrap text-[14.5px] text-muted hover:text-foreground sm:inline">{t.nav.login}</Link>
            <Link href="/signup" prefetch={false} className="sk-btn sk-btn-primary whitespace-nowrap px-4 py-2 text-[14px]">{t.nav.start}</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="sk-site-hero">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:pb-24">
          <div>
            <span className="sk-site-badge">{t.hero.badge}</span>
            <h1 className="sk-site-h1 mt-6">
              {t.hero.titleA}
              <br />
              <span className="text-accent">{t.hero.titleB}</span>
            </h1>
            <p className="sk-site-lead mt-6">{t.hero.sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" prefetch={false} className="sk-btn sk-btn-primary sk-site-btn">{t.hero.cta}</Link>
              <a href="#how" className="sk-btn sk-btn-ghost sk-site-btn">{t.hero.ctaSecondary}</a>
            </div>
            <p className="sk-site-note">{t.hero.note}</p>
            <div className="mt-7">
              <div className="mb-2 text-[12.5px] font-medium uppercase tracking-wide text-faint">{t.hero.languagesLabel}</div>
              <LanguageChips current={lang} />
            </div>
          </div>
          <PhoneChat copy={t.chat} />
        </div>
      </section>

      {/* ── What it does: four jobs ──────────────────────────────────────── */}
      <section className="sk-site-section">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="sk-site-h2">{t.jobs.title}</h2>
              <p className="sk-site-sub mt-4">{t.jobs.sub}</p>
            </div>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-5 md:grid-cols-2">
            {t.jobs.items.map((job, i) => (
              <div key={job.title} className="sk-site-card">
                <div className="sk-site-icon">{JOB_ICONS[i]}</div>
                <h3 className="mt-5 text-[20px] font-semibold leading-snug">{job.title}</h3>
                <p className="mt-2.5 text-[16px] leading-relaxed text-muted">{job.body}</p>
                <div className="sk-site-sample">{job.sample}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="sk-site-section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="sk-site-h2">{t.steps.title}</h2>
              <p className="sk-site-sub mt-4">{t.steps.sub}</p>
            </div>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {t.steps.items.map((step, i) => (
              <div key={step.title} className="flex gap-4 md:flex-col">
                <div className="sk-site-step-num">{i + 1}</div>
                <div>
                  <h3 className="text-[19px] font-semibold leading-snug">{step.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </Reveal>
          <div className="mt-12 text-center">
            <Link href="/signup" prefetch={false} className="sk-btn sk-btn-primary sk-site-btn">{t.hero.cta}</Link>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────────── */}
      <section className="sk-site-section">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="sk-site-h2 mx-auto max-w-2xl text-center">{t.trust.title}</h2>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {t.trust.items.map((item) => (
              <div key={item.title} className="flex gap-4">
                <Check />
                <div>
                  <h3 className="text-[18px] font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="sk-site-section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="sk-site-h2">{t.pricing.title}</h2>
              <p className="sk-site-sub mt-4">{t.pricing.sub}</p>
            </div>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-5 lg:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const limits = PLAN_LIMITS[key];
              const plan = t.pricing.plans[key];
              const featured = key === "growth";
              const lines = [
                limits.maxWhatsAppNumbers === 1 ? t.pricing.numberOne : fill(t.pricing.numberMany, limits.maxWhatsAppNumbers),
                fill(t.pricing.images, limits.imagesPerMonth),
                ...plan.features,
              ];
              return (
                <div key={key} className={`sk-site-card flex flex-col ${featured ? "featured" : ""}`}>
                  {featured && (
                    <span className="mb-4 w-fit rounded-full bg-accent px-3 py-1 text-[12px] font-bold text-[#05130a]">{t.pricing.popular}</span>
                  )}
                  <h3 className="text-[20px] font-semibold">{PLAN_NAMES[key]}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[40px] font-bold leading-none">₹{limits.priceInr.toLocaleString("en-IN")}</span>
                    <span className="text-[15px] text-faint">{t.pricing.month}</span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{plan.blurb}</p>
                  <ul className="mt-5 flex flex-1 flex-col gap-3">
                    {lines.map((line) => (
                      <li key={line} className="flex items-start gap-3 text-[15.5px] leading-snug">
                        <Check />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" prefetch={false} className={`sk-btn mt-7 w-full sk-site-btn ${featured ? "sk-btn-primary" : "sk-btn-ghost"}`}>{t.pricing.cta}</Link>
                </div>
              );
            })}
          </Reveal>
          <p className="mx-auto mt-6 max-w-2xl text-center text-[14px] leading-relaxed text-faint">{t.pricing.feeNote}</p>
          <div className="mt-10">
            <BillCalculator
              copy={t.calc}
              plans={PLAN_ORDER.map((key) => ({ key, name: PLAN_NAMES[key], priceInr: PLAN_LIMITS[key].priceInr }))}
            />
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────────────── */}
      <section id="faq" className="sk-site-section">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="sk-site-h2 text-center">{t.faq.title}</h2>
          </Reveal>
          <div className="sk-site-faq mt-10">
            {t.faq.items.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final call to action ─────────────────────────────────────────── */}
      <section className="sk-site-cta sk-site-section">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="sk-site-h2">{t.final.title}</h2>
          <p className="sk-site-sub mt-4">{t.final.sub}</p>
          <div className="mt-8">
            <Link href="/signup" prefetch={false} className="sk-btn sk-btn-primary sk-site-btn px-8">{t.final.cta}</Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col items-center gap-3 border-t border-border pt-6 text-[13.5px] text-faint sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {t.footer.legal}</span>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/changelog" className="hover:text-muted">{t.footer.changelog}</Link>
            <Link href="/privacy" className="hover:text-muted">{t.footer.privacy}</Link>
            <Link href="/terms" className="hover:text-muted">{t.footer.terms}</Link>
            <Link href="/support" className="hover:text-muted">{t.footer.support}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
