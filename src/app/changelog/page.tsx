import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Changelog — Sendkar" };

const ENTRIES = [
  {
    date: "August 24, 2026",
    items: [
      "WhatsApp Flows — build multi-screen forms that open right inside the chat, no browser redirect. Settings → Forms.",
      "Reactions and tappable reply buttons, both directions — react to a message from the inbox, or send up to 3 buttons instead of plain text.",
      "Typing indicators — the customer sees \"typing…\" while your team drafts a reply.",
      "Carousel templates — 2–10 scrollable product cards in one message.",
      "Revenue attribution — see which campaign actually drove a sale, logged by hand or synced from Shopify. Dashboard also now shows your top customers by spend.",
      "A guided WhatsApp connection wizard that verifies your credentials against Meta live, instead of saving on faith.",
      "⌘K / Ctrl+K command palette to jump anywhere instantly.",
      "The whole product is now available in Hindi, Marathi, Tamil, Telugu, and Kannada, alongside English.",
    ],
  },
  {
    date: "August 21, 2026",
    items: [
      "Agency mode — manage every client workspace from one login.",
      "Click-to-WhatsApp ad attribution — see which ad brought in a contact.",
      "A real marketing site and pricing, priced against what comparable platforms actually charge.",
    ],
  },
  {
    date: "August 18, 2026",
    items: [
      "A Claude/MCP connector — send messages, manage campaigns, and check revenue directly from Claude or any MCP client.",
      "Multi-language broadcasts — one campaign, each contact gets their own-language template automatically.",
      "AI-suggested automations, mined from your actual conversation history.",
    ],
  },
  {
    date: "August 15, 2026",
    items: [
      "AI features: template drafting from a plain description, automatic message tagging and sentiment, thread summaries.",
      "Real-time inbox — new messages appear without refreshing.",
      "Multiple WhatsApp numbers per workspace.",
      "Instagram DMs and Facebook Messenger in the same inbox.",
    ],
  },
  {
    date: "August 10, 2026",
    items: [
      "Product catalog and in-chat product cards.",
      "A branching chatbot flow builder.",
      "Shopify and WooCommerce order confirmations, Klaviyo sync, Google Sheets contact import.",
    ],
  },
] as const;

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="mb-6 flex items-center gap-2.5">
        <Logo />
        <span className="text-[15px] font-semibold tracking-tight">Sendkar</span>
      </Link>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Changelog</h1>
      <p className="mb-10 text-[14px] text-muted">What&apos;s shipped, most recent first.</p>

      <div className="flex flex-col gap-10">
        {ENTRIES.map((entry) => (
          <div key={entry.date}>
            <div className="mb-3 font-mono text-[12px] text-faint">{entry.date}</div>
            <ul className="flex flex-col gap-2.5">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
