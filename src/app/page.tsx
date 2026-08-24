import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";

const CHAT_DEMO = [
  { side: "in" as const, text: "Hi! Is the Diwali set still available in medium?" },
  { side: "out" as const, text: "Yes — ₹1,899, ships tomorrow if you order today 🎉" },
  { side: "in" as const, text: "Perfect, sending payment now" },
] as const;

const FEATURES = [
  {
    title: "One campaign, every language",
    body: "Group translated templates together and Sendkar auto-sends each contact their own-language version from a single broadcast — no manual segmentation, no launching one campaign per language.",
  },
  {
    title: "AI that drafts, tags, and suggests",
    body: "Claude drafts full WhatsApp templates from a plain description, auto-tags every inbound message by intent and sentiment, and mines your chat history for automations worth adding — before you even ask.",
  },
  {
    title: "A chatbot builder that branches",
    body: "Multi-step flows that route by keyword, not a single fixed auto-reply. Trigger, ask, branch, resolve — an actual conversation, not a canned response.",
  },
  {
    title: "Product catalog, in-chat",
    body: "Send product cards or your full catalog straight into WhatsApp, backed by Meta Commerce Manager — customers browse and buy without leaving the chat.",
  },
  {
    title: "Real integrations, not a promise",
    body: "Shopify and WooCommerce auto-send order confirmations. Klaviyo syncs every new contact. Google Sheets imports directly. A generic send API and webhooks reach Zapier, Make, and Pabbly Connect.",
  },
  {
    title: "Built for Claude and AI agents",
    body: "13 MCP tools — send messages, manage campaigns, log a sale, check delivery status — straight from Claude. No other WhatsApp platform ships an AI agent connector.",
  },
];

const PLANS = [
  { key: "free", name: "Free" as const, blurb: "One number, one seat — try it for real." },
  { key: "starter", name: "Starter" as const, blurb: "Automations + branching chatbot flows, up to 5 seats." },
  { key: "growth", name: "Growth" as const, blurb: "Catalog, Instagram, Messenger, webhooks, up to 15 seats.", featured: true },
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
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M3 10l7-7 7 7M3 10l7 7 7-7" stroke="#05130a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Sendkar</span>
        </div>
        <nav className="flex items-center gap-5">
          <a href="#pricing" className="text-[13.5px] text-muted hover:text-foreground">Pricing</a>
          <a href="/mcp" className="text-[13.5px] text-muted hover:text-foreground">MCP</a>
          <Link href="/login" className="text-[13.5px] text-muted hover:text-foreground">Log in</Link>
          <Link href="/signup" className="sk-btn sk-btn-primary text-[13.5px]">Get started</Link>
        </nav>
      </header>

      <section className="relative px-6 pb-28 pt-16">
        <div className="sk-grid-bg" />
        <div className="sk-glow" />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="sk-eyebrow mb-6">WhatsApp Business Platform</div>
            <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-tight sm:text-[64px]">
              Send once.
              <br />
              <span className="font-light text-muted">Every language,</span>
              <br />
              <span className="text-accent">half the price.</span>
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
              Campaigns, a shared team inbox, chatbot flows, and a product catalog on Meta&apos;s real Cloud API — plus
              revenue attribution and a Claude connector no other WhatsApp platform ships.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="sk-btn sk-btn-primary px-5 py-2.5 text-[14.5px]">Get started free →</Link>
              <a href="#pricing" className="sk-btn sk-btn-ghost px-5 py-2.5 text-[14.5px]">See pricing</a>
            </div>
            <p className="mt-4 text-[12.5px] text-faint">No card required for Free · Meta&apos;s official Cloud API, not a reseller</p>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">Channels</div>
              </div>
              <div>
                <div className="text-2xl font-bold">13</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">MCP tools for Claude</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">½</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">The price of the rest</div>
              </div>
            </div>
          </div>

          <div className="sk-phone">
            <div className="sk-phone-notch" />
            <div className="sk-phone-header">
              <div className="sk-phone-avatar" />
              <div>
                <div className="text-[13px] font-medium">Meera Textiles</div>
                <div className="text-[11px] text-faint">via Sendkar</div>
              </div>
            </div>
            <div className="sk-phone-body">
              {CHAT_DEMO.map((m, i) => (
                <div key={i} className={`sk-chat-bubble ${m.side}`} style={{ animationDelay: `${0.3 + i * 0.55}s` }}>
                  {m.text}
                </div>
              ))}
              <div className="sk-typing" style={{ animationDelay: `${0.3 + CHAT_DEMO.length * 0.55}s` }}>
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 max-w-lg">
          <div className="sk-eyebrow mb-3">What&apos;s actually built</div>
          <h2 className="text-[28px] font-semibold tracking-tight">Not a landing page promise.</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="sk-card group relative overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-accent-dim">
              <div className="mb-3 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</div>
              <div className="mb-2 font-medium">{f.title}</div>
              <p className="text-[13.5px] text-muted">{f.body}</p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">Pricing</h2>
        <p className="mb-6 text-center text-[13px] text-faint">Roughly half of what comparable WhatsApp platforms charge for the same limits.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>

      <section className="sk-cta-band relative px-6 py-20">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
            Your WhatsApp campaigns deserve better than a spreadsheet of phone numbers.
          </h2>
          <p className="mt-4 text-[15px] text-muted">Free to start, real Cloud API from day one, no card required.</p>
          <Link href="/signup" className="sk-btn sk-btn-primary mt-7 inline-flex px-6 py-3 text-[15px]">Get started free →</Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 border-t border-border pt-6 text-[12.5px] text-faint sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Signalpulse Technologies LLC — Sendkar is built on the WhatsApp Business Platform (Meta Cloud API), not a reseller.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-muted">Privacy</Link>
            <Link href="/terms" className="hover:text-muted">Terms</Link>
            <Link href="/support" className="hover:text-muted">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
