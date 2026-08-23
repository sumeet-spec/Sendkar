import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    body: "The only WhatsApp platform with a first-class MCP connector — send messages, manage campaigns, and check delivery status straight from Claude.",
  },
];

const PLANS = [
  { name: "Free", price: "₹0", blurb: "One number, one seat — try it for real." },
  { name: "Starter", price: "₹999", blurb: "Automations, up to 3 team members." },
  { name: "Growth", price: "₹2,999", blurb: "Chatbot flows, catalog, Instagram, up to 10 seats.", featured: true },
  { name: "Scale", price: "₹7,999", blurb: "Everything, unlimited seats." },
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

      <section className="mx-auto max-w-3xl px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
          WhatsApp Business, without the segmenting or the seat prices.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[16px] text-muted">
          Campaigns, a shared team inbox, chatbot flows, and a product catalog — plus AI features and a Claude
          connector no other WhatsApp platform ships.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="sk-btn sk-btn-primary px-5 py-2.5 text-[14.5px]">Get started free</Link>
          <a href="#pricing" className="sk-btn sk-btn-ghost px-5 py-2.5 text-[14.5px]">See pricing</a>
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
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight">Pricing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className="sk-card p-5"
              style={p.featured ? { borderColor: "var(--accent-dim)", boxShadow: "0 0 0 1px var(--accent-dim)" } : undefined}
            >
              <div className="mb-1 font-medium">{p.name}</div>
              <div className="mb-2 text-2xl font-semibold">{p.price}<span className="text-[13px] font-normal text-faint">/mo</span></div>
              <p className="text-[12.5px] text-muted">{p.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-[12.5px] text-faint">
        Sendkar — built on the WhatsApp Business Platform (Meta Cloud API), not a reseller.
      </footer>
    </div>
  );
}
