import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { StoryCarousel, type StoryMoment } from "@/components/StoryCarousel";

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
  { tag: "Marketing", title: "Broadcast in every language, one click", body: "Group translated templates together — Sendkar auto-sends each contact their own-language version from a single broadcast." },
  { tag: "AI Copilot", title: "Drafts templates, tags leads, on its own", body: "Claude drafts a template from a plain description and auto-tags every inbound message by intent and sentiment." },
  { tag: "Automation", title: "Chatbots that actually branch", body: "Multi-step flows that route by keyword — an actual conversation, not a single canned reply." },
  { tag: "Commerce", title: "Catalog, cart recovery, and payments", body: "Real WhatsApp catalog cards, an automatic nudge when a Shopify cart goes cold, and a Razorpay/PayU link — all in the same thread." },
  { tag: "Support", title: "One inbox, auto-assigned", body: "Every conversation in one place. A new chat goes to whoever's free right now, not whoever grabs their phone first." },
  { tag: "Analytics", title: "Revenue traced to the ad, not just delivered", body: "WATI and Interakt stop at delivered/read. Sendkar links the sale back to the exact campaign that earned it." },
];

const PLANS = [
  { key: "free", name: "Free" as const, blurb: "One number, one seat — try it for real." },
  { key: "starter", name: "Starter" as const, blurb: "Automations + branching chatbot flows, unlimited seats." },
  { key: "growth", name: "Growth" as const, blurb: "Catalog, Instagram, Messenger, webhooks, unlimited seats.", featured: true },
  { key: "scale", name: "Scale" as const, blurb: "Everything, unlimited seats." },
];

export default async function RootPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/dashboard");

  return (
    <div className="flex-1 overflow-x-hidden">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">Sendkar</span>
        </div>
        <nav className="flex items-center gap-5">
          <a href="#pricing" className="text-[13.5px] text-muted hover:text-foreground">Pricing</a>
          <a href="/mcp" className="text-[13.5px] text-muted hover:text-foreground">MCP</a>
          <Link href="/login" className="text-[13.5px] text-muted hover:text-foreground">Log in</Link>
          <Link href="/signup" className="sk-btn sk-btn-primary text-[13.5px]">Get started</Link>
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
            <div className="sk-eyebrow mb-6">WhatsApp Marketing Software</div>
            <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-tight sm:text-[64px]">
              Send once.
              <br />
              <span className="font-light text-muted">Every language,</span>
              <br />
              <span className="text-accent">half the price.</span>
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
              This is Priya Textiles&apos; actual order, start to finish — an Instagram ad, a reply in her
              customer&apos;s own language, a payment collected without leaving WhatsApp, and revenue traced back to
              the ad that earned it.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="sk-btn sk-btn-primary px-5 py-2.5 text-[14.5px]">Get started free →</Link>
              <a href="#pricing" className="sk-btn sk-btn-ghost px-5 py-2.5 text-[14.5px]">See pricing</a>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="sk-pill border-accent text-accent">⚡ Meta&apos;s official Cloud API — not a reseller</span>
              <span className="sk-pill">🆓 Free plan, forever — not a 14-day trial</span>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">Channels</div>
              </div>
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">MCP tools for Claude</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">½</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">The price of the rest</div>
              </div>
            </div>
          </div>

          <div>
            <StoryCarousel moments={STORY_MOMENTS} name="Priya Textiles" subtitle="via Sendkar" />
            <p className="mt-4 text-center text-[11.5px] text-faint">Priya Textiles&apos; actual order — one ad to one confirmed sale, every step automatic.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Reveal className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <div className="sk-eyebrow mb-4">Revenue, not just delivery</div>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">See which campaign actually made you money.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              WATI and Interakt stop at delivered/read. Sendkar links Priya&apos;s sale — synced straight from
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
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Revenue this month</div>
                  <div className="text-xl font-semibold">₹1,84,500</div>
                </div>
                <div className="sk-card p-4">
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">From that Instagram ad</div>
                  <div className="text-xl font-semibold text-accent">₹4,200</div>
                </div>
              </div>
              <div className="sk-card mt-3 overflow-hidden">
                <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Recent orders</div>
                {[
                  ["919900...1122", "the order above", "Diwali IG ad", "₹4,200"],
                  ["919900...1189", "Rohan Gupta", "organic", "₹3,200"],
                  ["919900...1156", "Kavya Menon", "organic", "₹2,499"],
                ].map((row) => (
                  <div key={row[0]} className="flex items-center justify-between border-b border-border px-4 py-2 text-[12.5px] last:border-0">
                    <span className="font-mono text-faint">{row[0]} <span className="text-muted">· {row[1]} · {row[2]}</span></span>
                    <span className="text-accent">{row[3]}</span>
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
            </div>
            <div className="flex h-64">
              <div className="w-2/5 border-r border-border p-2">
                {[
                  ["Meena Reddy", "Perfect, sending payment now"],
                  ["Ravi Kumar", "Can I get this in blue?"],
                  ["Ananya Iyer", "Order arrived, thank you! 🙏"],
                ].map(([n, preview], i) => (
                  <div key={n} className={`rounded-md px-2.5 py-2 text-[12px] ${i === 0 ? "bg-surface-2" : ""}`}>
                    <div className="font-medium text-foreground">{n}</div>
                    <div className="text-faint">{preview}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="max-w-[80%] self-start rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[12px]">Hi! Is the Diwali set still available?</div>
                <div className="max-w-[80%] self-end rounded-lg bg-accent px-3 py-1.5 text-[12px] text-[#05130a]">Yes — ₹1,899, ships tomorrow 🎉</div>
                <div className="max-w-[80%] self-start rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[12px]">Perfect, sending payment now</div>
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
              <div key={f.title} className="sk-card p-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-accent">{f.tag}</div>
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
                className="sk-card p-5"
                style={p.featured ? { borderColor: "var(--accent-dim)", boxShadow: "0 0 0 1px var(--accent-dim)" } : undefined}
              >
                <div className="mb-1 font-medium">{p.name}</div>
                <div className="mb-2 text-2xl font-semibold">
                  {limits.priceInr === 0 ? "₹0" : `₹${limits.priceInr.toLocaleString("en-IN")}`}
                  <span className="text-[13px] font-normal text-faint">/mo</span>
                </div>
                <p className="text-[12.5px] text-muted">{p.blurb}</p>
              </div>
            );
          })}
        </Reveal>
      </section>

      <section className="sk-cta-band relative px-6 py-20">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
            Your WhatsApp Marketing deserves better than a spreadsheet of phone numbers.
          </h2>
          <p className="mt-4 text-[15px] text-muted">Free to start, real Cloud API from day one, no card required.</p>
          <Link href="/signup" className="sk-btn sk-btn-primary mt-7 inline-flex px-6 py-3 text-[15px]">Get started free →</Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 border-t border-border pt-6 text-[12.5px] text-faint sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Signalpulse Technologies LLC — Sendkar is built on the WhatsApp Business Platform (Meta Cloud API), not a reseller.</span>
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
