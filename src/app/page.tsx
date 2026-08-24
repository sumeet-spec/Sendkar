import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

const CHAT_DEMO = [
  { side: "in" as const, text: "Hi! Is the Diwali set still available in medium?" },
  { side: "out" as const, text: "Yes — ₹1,899, ships tomorrow if you order today 🎉" },
  { side: "in" as const, text: "Perfect, sending payment now" },
] as const;

const MORE_BUILT = [
  { title: "One campaign, every language", body: "Group translated templates together — Sendkar auto-sends each contact their own-language version from a single broadcast." },
  { title: "AI that drafts, tags, and suggests", body: "Claude drafts templates from a plain description and auto-tags every inbound message by intent and sentiment." },
  { title: "A chatbot builder that branches", body: "Multi-step flows that route by keyword — an actual conversation, not a canned response." },
  { title: "Real integrations, not a promise", body: "Shopify and WooCommerce order confirmations, Klaviyo sync, Google Sheets import, and webhooks to Zapier or Make." },
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
                <div className="text-2xl font-bold">15</div>
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

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Reveal className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <div className="sk-eyebrow mb-4">Revenue, not just delivery</div>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">See which campaign actually made you money.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              WATI and Interakt stop at delivered/read. Sendkar links real sales — logged by hand or synced from
              Shopify — back to the campaign that drove them, with a 7-day attribution window.
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
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Revenue tracked</div>
                  <div className="text-xl font-semibold">₹18,540</div>
                </div>
                <div className="sk-card p-4">
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">From a campaign</div>
                  <div className="text-xl font-semibold text-accent">₹11,200</div>
                </div>
              </div>
              <div className="sk-card mt-3 overflow-hidden">
                <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Top customers</div>
                {[["919900...1122", "Priya Sharma", "₹5,600"], ["919900...1189", "Rohan Gupta", "₹3,200"], ["919900...1156", "Kavya Menon", "₹2,499"]].map((row) => (
                  <div key={row[0]} className="flex items-center justify-between border-b border-border px-4 py-2 text-[12.5px] last:border-0">
                    <span className="font-mono text-faint">{row[0]} <span className="text-muted">· {row[1]}</span></span>
                    <span className="text-accent">{row[2]}</span>
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
                {["Priya Sharma", "Ravi Kumar", "Ananya Iyer"].map((n, i) => (
                  <div key={n} className={`rounded-md px-2.5 py-2 text-[12px] ${i === 0 ? "bg-surface-2" : ""}`}>
                    <div className="font-medium text-foreground">{n}</div>
                    <div className="text-faint">Perfect, sending payment now</div>
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
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">A shared team inbox, not five people&apos;s phones.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Every conversation in one place, with AI-drafted replies, canned responses, private notes, and
              assignment to a teammate — inside the same 24-hour window Meta actually enforces.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border pt-14 sm:grid-cols-2">
          {MORE_BUILT.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              <div>
                <div className="mb-1 font-medium">{f.title}</div>
                <p className="text-[13.5px] text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 pb-24">
        <Reveal>
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
        </Reveal>
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
