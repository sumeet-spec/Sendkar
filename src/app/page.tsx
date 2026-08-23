import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";

const MOCK_LOG = [
  { status: "done" as const, title: "TEMPLATE SUBMITTED", detail: "diwali_sale — hi, ta, te" },
  { status: "done" as const, title: "META APPROVED", detail: "3/3 languages" },
  { status: "done" as const, title: "CAMPAIGN LAUNCHED", detail: "auto-routed by contact language" },
  { status: "active" as const, title: "SENDING", detail: "1,204 / 3,000 delivered" },
  { status: "todo" as const, title: "AI TAGGED REPLY", detail: "\"price-question\" · sentiment: neutral" },
  { status: "todo" as const, title: "CLAUDE CONNECTED", detail: "11 tools ready via MCP" },
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
    body: "11 MCP tools — send messages, manage campaigns, check delivery status — straight from Claude. No other WhatsApp platform ships an AI agent connector.",
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
    <div className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-14 pb-24 lg:grid-cols-2">
        <div>
          <div className="sk-eyebrow mb-5">WhatsApp Business Platform</div>
          <h1 className="text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-[52px]">
            Send once.
            <br />
            Every language.
            <br />
            <span className="text-accent">Half the price.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15.5px] text-muted">
            Campaigns, a shared team inbox, chatbot flows, and a product catalog on Meta&apos;s real Cloud API — plus
            AI features and a Claude connector no other WhatsApp platform ships.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="sk-btn sk-btn-primary px-5 py-2.5 text-[14.5px]">Get started free →</Link>
            <a href="#pricing" className="sk-btn sk-btn-ghost px-5 py-2.5 text-[14.5px]">See pricing</a>
          </div>
          <p className="mt-4 text-[12.5px] text-faint">No card required for Free · Meta&apos;s official Cloud API, not a reseller</p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">Channels</div>
            </div>
            <div>
              <div className="text-2xl font-bold">11</div>
              <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">MCP tools for Claude</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">½</div>
              <div className="mt-0.5 text-[11.5px] uppercase tracking-wide text-faint">The price of the rest</div>
            </div>
          </div>
        </div>

        <div className="sk-mock-panel">
          <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger opacity-60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warn opacity-60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent opacity-60" />
            <span className="ml-2 font-mono text-[11.5px] text-faint">sendkar — live campaign</span>
          </div>
          {MOCK_LOG.map((line) => (
            <div key={line.title} className="sk-mock-line">
              <span className={`sk-mock-check ${line.status === "todo" ? "" : line.status}`}>
                {line.status === "done" ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : line.status === "active" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full border border-border" />
                )}
              </span>
              <div>
                <div className="font-mono text-[12px] font-semibold tracking-wide text-foreground">{line.title}</div>
                <div className="font-mono text-[11.5px] text-faint">{line.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="sk-card p-5">
              <div className="mb-2 font-medium">{f.title}</div>
              <p className="text-[13.5px] text-muted">{f.body}</p>
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

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-[12.5px] text-faint">
        Sendkar — built on the WhatsApp Business Platform (Meta Cloud API), not a reseller.
      </footer>
    </div>
  );
}
