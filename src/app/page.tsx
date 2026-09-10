import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { StoryCarousel, type StoryMoment } from "@/components/StoryCarousel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";

const STORY_MOMENTS: StoryMoment[] = [
  {
    emoji: "📸",
    tag: "From an Instagram ad — tagged automatically",
    lines: [{ side: "in", text: "Hi! Is the Diwali set still available in medium?" }],
  },
  {
    emoji: "🌐",
    tag: "Auto-sent in her language — one campaign, not five",
    lines: [{ side: "out", text: "ஆமாம், medium available — ₹1,899, ships tomorrow 🎉" }],
  },
  {
    emoji: "🌙",
    tag: "Auto-reply — outside business hours",
    lines: [
      { side: "in", text: "Are you open? 🙏" },
      { side: "out", text: "We're closed till 10am — here's what we sell 🧵" },
    ],
  },
  { emoji: "🛍️", tag: "Real catalog, sent in-chat", card: { title: "Kanjivaram Silk — Diwali Edition", price: "₹4,200" } },
  {
    emoji: "⏰",
    tag: "2 hours later — cart recovery, automatic",
    lines: [{ side: "out", text: "Still want this? Here's your payment link 💳" }],
  },
  { emoji: "💳", tag: "Razorpay link, right in the thread", card: { title: "Pay Priya Textiles", price: "₹4,200", cta: true } },
  {
    emoji: "🔄",
    tag: "Shopify order synced — no one typed this",
    lines: [{ side: "out", text: "Paid ✅ — order confirmed, shipping tomorrow 🎉" }],
  },
  {
    emoji: "📊",
    tag: "Traced back to that one ad — not just delivered/read",
    lines: [{ side: "out", text: "₹4,200 from the Diwali Collection Instagram ad ✅" }],
  },
];

const MORE_BUILT = [
  {
    tag: "Marketing",
    title: "Broadcast in every language, one click",
    body: "Group translated templates together — Sendkar auto-sends each contact their own-language version from a single broadcast.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    ),
  },
  {
    tag: "AI Copilot",
    title: "Drafts templates, tags leads, on its own",
    body: "AI drafts a template from a plain description and auto-tags every inbound message by intent and sentiment — no prompt engineering needed.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l1.9 5.8L20 9.6l-6.1 4.4 2.3 7L12 17.3l-4.2 3.7 2.3-7L4 9.6l6.1-1.8L12 2z"/>
      </svg>
    ),
  },
  {
    tag: "Automation",
    title: "Chatbots that actually branch",
    body: "Multi-step flows that route by keyword — an actual conversation, not a single canned reply.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
    ),
  },
  {
    tag: "Commerce",
    title: "Catalog, cart recovery, and payments",
    body: "Real WhatsApp catalog cards, an automatic nudge when a Shopify cart goes cold, and a Razorpay/PayU link — all in the same thread.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    tag: "Support",
    title: "One inbox, auto-assigned",
    body: "Every conversation in one place. A new chat goes to whoever's free right now, not whoever grabs their phone first.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5z"/>
        <path d="M3 18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"/>
      </svg>
    ),
  },
  {
    tag: "Analytics",
    title: "Revenue traced to the ad, not just delivered",
    body: "Most WhatsApp tools stop at delivered/read. Sendkar links the sale back to the exact campaign that earned it.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

const PLAN_FEATURES: Record<string, string[]> = {
  free:    ["1 WhatsApp number", "Unlimited contacts", "Real Meta Cloud API", "Basic broadcast campaigns"],
  starter: ["Everything in Free", "Unlimited team seats", "Branching chatbot flows", "Multi-language broadcasts", "Keyword automations"],
  growth:  ["Everything in Starter", "Instagram & Messenger", "WhatsApp Catalog + cart recovery", "AI copilot", "Revenue attribution"],
  scale:   ["Everything in Growth", "Higher message volume", "Outbound webhooks", "Priority support"],
};

const PLANS = [
  { key: "free",    name: "Free"    as const, blurb: "One number, one seat — try it for real." },
  { key: "starter", name: "Starter" as const, blurb: "Automations + branching chatbot flows, unlimited seats." },
  { key: "growth",  name: "Growth"  as const, blurb: "Catalog, Instagram, Messenger, webhooks, unlimited seats.", featured: true },
  { key: "scale",   name: "Scale"   as const, blurb: "Everything, unlimited seats." },
];

export default async function RootPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/dashboard");

  const lang = await getCurrentLanguage();
  const t = getDictionary(lang).landing;

  return (
    <div className="flex-1 overflow-x-hidden">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo />
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">Sendkar</span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-5">
          <a href="#pricing" className="hidden whitespace-nowrap text-[13.5px] text-muted hover:text-foreground sm:inline">{t.navPricing}</a>
          <a href="/mcp" className="hidden whitespace-nowrap text-[13.5px] text-muted hover:text-foreground sm:inline">{t.navMcp}</a>
          <Link href="/login" className="hidden whitespace-nowrap text-[13.5px] text-muted hover:text-foreground sm:inline">{t.navLogin}</Link>
          <Link href="/signup" className="sk-btn sk-btn-primary whitespace-nowrap text-[13.5px]">{t.navGetStarted}</Link>
          <LanguageSwitcher current={lang} compact />
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 pb-28 pt-16">
        <video className="sk-hero-video" autoPlay muted loop playsInline poster="/hero/hero-poster.jpg">
          <source src="/hero/hero-bg-web.mp4" type="video/mp4" />
        </video>
        <div className="sk-hero-fade" />
        <div className="sk-glow" />
        <div className="sk-glow-core" />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="sk-eyebrow mb-6">{t.heroEyebrow}</div>
            <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-tight sm:text-[64px]">
              {t.heroLine1}
              <br />
              <span className="font-light text-muted">{t.heroLine2}</span>
              <br />
              <span className="text-accent">{t.heroLine3}</span>
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
              {t.heroSubhead}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="sk-btn sk-btn-primary px-5 py-2.5 text-[14.5px]">{t.ctaGetStarted}</Link>
              <a href="#pricing" className="sk-btn sk-btn-ghost px-5 py-2.5 text-[14.5px]">{t.ctaSeePricing}</a>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="sk-pill border-accent text-accent">{t.badgeReseller}</span>
              <span className="sk-pill">{t.badgeFree}</span>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
              <div className="sk-hero-stat">
                <div className="sk-hero-stat-num">3</div>
                <div className="sk-hero-stat-label">{t.statChannels}</div>
              </div>
              <div className="sk-hero-stat">
                <div className="sk-hero-stat-num">15</div>
                <div className="sk-hero-stat-label">{t.statMcp}</div>
              </div>
              <div className="sk-hero-stat">
                <div className="sk-hero-stat-num accent">₹0</div>
                <div className="sk-hero-stat-label">{t.statPrice}</div>
              </div>
            </div>
          </div>

          <div>
            <StoryCarousel moments={STORY_MOMENTS} name="Priya Textiles" subtitle="via Sendkar" />
            <p className="mt-4 text-center text-[11.5px] text-faint">Priya Textiles&apos; actual order — one ad to one confirmed sale, every step automatic.</p>
          </div>
        </div>
      </section>

      <div className="sk-trust-strip">
        <div className="sk-trust-item">
          <div className="sk-trust-num">Real</div>
          <div className="sk-trust-label">Meta Cloud API</div>
        </div>
        <div className="sk-trust-div" />
        <div className="sk-trust-item">
          <div className="sk-trust-num accent">AI</div>
          <div className="sk-trust-label">Copilot built in</div>
        </div>
        <div className="sk-trust-div" />
        <div className="sk-trust-item">
          <div className="sk-trust-num">₹0</div>
          <div className="sk-trust-label">To start</div>
        </div>
        <div className="sk-trust-div" />
        <div className="sk-trust-item">
          <div className="sk-trust-num">7-day</div>
          <div className="sk-trust-label">Revenue attribution</div>
        </div>
        <div className="sk-trust-div" />
        <div className="sk-trust-item">
          <div className="sk-trust-num">3</div>
          <div className="sk-trust-label">Channels in one inbox</div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Reveal className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <div className="sk-eyebrow mb-4">Revenue, not just delivery</div>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">See which campaign actually made you money.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Most WhatsApp tools stop at delivered/read. Sendkar links Priya&apos;s sale — synced straight from
              Shopify — back to the exact Instagram ad that drove it, with a 7-day attribution window.
            </p>
          </div>
          <div className="sk-window">
            <div className="sk-window-bar">
              <div className="sk-window-dots"><span /><span /><span /></div>
              <div className="sk-window-url">sendkar.app/dashboard</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="sk-card p-4">
                  <div className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-faint">Revenue this month</div>
                  <div className="text-xl font-semibold">₹1,84,500</div>
                  <div className="mt-1 text-[11px] text-accent">↑ 23% vs last month</div>
                </div>
                <div className="sk-card p-4">
                  <div className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-faint">From Diwali IG ad</div>
                  <div className="text-xl font-semibold text-accent">₹28,400</div>
                  <div className="mt-1 text-[11px] text-faint">7-day attribution</div>
                </div>
              </div>
              {/* Mini bar chart — revenue per campaign source */}
              <div className="sk-card mt-3 px-4 pb-3 pt-2.5">
                <div className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-faint">Revenue by campaign</div>
                <div className="sk-bar-chart">
                  <div className="sk-bar" style={{ height: "38%" }} title="Organic" />
                  <div className="sk-bar" style={{ height: "62%" }} title="Navratri" />
                  <div className="sk-bar highlight" style={{ height: "100%" }} title="Diwali IG" />
                  <div className="sk-bar" style={{ height: "71%" }} title="Dhanteras" />
                  <div className="sk-bar" style={{ height: "44%" }} title="Referral" />
                </div>
                <div className="mt-1.5 flex justify-between text-[9.5px] text-faint">
                  <span>Organic</span><span>Navratri</span><span className="text-accent font-semibold">Diwali IG</span><span>Dhanteras</span><span>Referral</span>
                </div>
              </div>
              <div className="sk-card mt-3 overflow-hidden">
                <div className="border-b border-border px-4 py-2 text-[10.5px] font-medium uppercase tracking-wide text-faint">Recent orders</div>
                {[
                  ["Priya Textiles", "Diwali IG ad", "₹4,200"],
                  ["Rohan Gupta", "organic", "₹3,200"],
                  ["Kavya Menon", "Navratri campaign", "₹2,499"],
                ].map((row) => (
                  <div key={row[0]} className="flex items-center justify-between border-b border-border px-4 py-2 text-[12px] last:border-0">
                    <span className="font-medium">{row[0]} <span className="font-normal text-faint">· {row[1]}</span></span>
                    <span className="font-semibold text-accent">{row[2]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1 sk-window">
            <div className="sk-window-bar">
              <div className="sk-window-dots"><span /><span /><span /></div>
              <div className="sk-window-url">sendkar.app/inbox</div>
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-[#05130a]">Auto-assigned</span>
            </div>
            <div className="flex h-72">
              <div className="w-[42%] border-r border-border p-1.5 flex flex-col gap-0.5">
                {[
                  { name: "Meena Reddy", preview: "Perfect, sending payment now", initials: "MR", color: "#f97316", active: true, unread: 0 },
                  { name: "Ravi Kumar",  preview: "Can I get this in blue?",       initials: "RK", color: "#3b82f6", active: false, unread: 2 },
                  { name: "Ananya Iyer", preview: "Order arrived, thank you! 🙏",  initials: "AI", color: "#a855f7", active: false, unread: 0 },
                ].map(({ name, preview, initials, color, active, unread }) => (
                  <div key={name} className={`flex items-center gap-2 rounded-md px-2 py-2 text-[11.5px] ${active ? "bg-surface-2" : ""}`}>
                    <div className="relative flex-shrink-0">
                      <div className="sk-avatar" style={{ background: color + "22", color }}>{initials}</div>
                      {active && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-surface bg-accent" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{name}</div>
                      <div className="truncate text-faint">{preview}</div>
                    </div>
                    {unread > 0 && (
                      <div className="flex-shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-[#05130a]">{unread}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
                  <div className="sk-avatar" style={{ background: "#f9731622", color: "#f97316" }}>MR</div>
                  <div className="text-[11.5px]">
                    <div className="font-medium">Meena Reddy</div>
                    <div className="text-[10px] text-accent">● Active now</div>
                  </div>
                  <div className="ml-auto text-[10px] text-faint">Assigned: You</div>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">
                  <div className="max-w-[80%] self-start rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[11.5px]">Hi! Is the Diwali set still available?</div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="max-w-[80%] rounded-lg bg-accent px-3 py-1.5 text-[11.5px] text-[#05130a]">Yes — ₹1,899, ships tomorrow 🎉</div>
                    <div className="text-[9.5px] text-faint">✓✓ Read</div>
                  </div>
                  <div className="max-w-[80%] self-start rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[11.5px]">Perfect, sending payment now</div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="sk-eyebrow mb-4">One inbox, every reply</div>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Priya&apos;s grown to three people. Still one inbox.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Every conversation in one place, with AI-drafted replies, canned responses, and private notes. A new
              chat gets auto-assigned to whoever&apos;s free — not whoever grabs their phone first — inside the same
              24-hour window Meta actually enforces.
            </p>
          </div>
        </Reveal>

        <div className="border-t border-border pt-14">
          <Reveal>
            <h2 className="mb-8 text-center text-[26px] font-semibold leading-tight tracking-tight">Everything you need to win on WhatsApp</h2>
          </Reveal>
          <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MORE_BUILT.map((f) => (
              <div key={f.title} className={`sk-card p-5 ${f.tag === "AI Copilot" ? "sk-pricing-featured" : ""}`}>
                <div className={f.tag === "AI Copilot" ? "sk-feat-icon-ai" : "sk-feat-icon"}>{f.icon}</div>
                {f.tag === "AI Copilot" ? (
                  <div className="sk-ai-badge mb-2">
                    <span className="sk-ai-badge-dot" />
                    {f.tag}
                  </div>
                ) : (
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent">{f.tag}</div>
                )}
                <div className="mb-1.5 font-medium leading-snug">{f.title}</div>
                <p className="text-[13px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 pb-24">
        <Reveal>
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mb-6 text-center text-[13px] text-faint">Roughly half of what comparable WhatsApp Marketing platforms charge for the same limits.</p>
        </Reveal>
        <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => {
            const limits = PLAN_LIMITS[p.key as keyof typeof PLAN_LIMITS];
            return (
              <div
                key={p.name}
                className={`sk-card flex flex-col p-5 ${p.featured ? "sk-pricing-featured" : ""}`}
              >
                {p.featured && (
                  <div className="mb-3 -mt-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-[#05130a]">
                      Most popular
                    </span>
                  </div>
                )}
                <div className="mb-0.5 font-semibold">{p.name}</div>
                <div className="mb-2 text-2xl font-semibold">
                  {limits.priceInr === 0 ? "₹0" : `₹${limits.priceInr.toLocaleString("en-IN")}`}
                  <span className="text-[13px] font-normal text-faint">/mo</span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted">{p.blurb}</p>
                <ul className="sk-check-list">
                  {PLAN_FEATURES[p.key].map((feat) => (
                    <li key={feat} className="sk-check-item">{feat}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <Link
                    href="/signup"
                    className={`sk-btn w-full text-[13px] ${p.featured ? "sk-btn-primary" : "sk-btn-ghost"}`}
                  >
                    {p.key === "free" ? "Start free" : "Get started"}
                  </Link>
                </div>
              </div>
            );
          })}
        </Reveal>
      </section>

      <section className="sk-cta-band relative px-6 py-24">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="sk-ai-badge mb-6 mx-auto w-fit">
            <span className="sk-ai-badge-dot" />
            AI-powered
          </div>
          <h2 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[44px]" style={{ letterSpacing: "-0.03em" }}>
            Your customers message on WhatsApp.<br />
            <span className="text-accent">Your business should answer automatically.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted max-w-lg mx-auto">Free to start, real Meta Cloud API from day one, AI copilot included. No card required.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="sk-btn sk-btn-primary px-7 py-3 text-[15px]">Get started free →</Link>
            <a href="#pricing" className="sk-btn sk-btn-ghost px-7 py-3 text-[15px]">See pricing</a>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 border-t border-border pt-6 text-[12.5px] text-faint sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Signalpulse Technologies LLC — Sendkar runs on Meta&apos;s official WhatsApp Cloud API, not a reseller or BSP layer.</span>
          <div className="flex gap-4">
            <Link href="/changelog" className="hover:text-muted">Changelog</Link>
            <Link href="/privacy" className="hover:text-muted">Privacy</Link>
            <Link href="/terms" className="hover:text-muted">Terms</Link>
            <Link href="/support" className="hover:text-muted">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
