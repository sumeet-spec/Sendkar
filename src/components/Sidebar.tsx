"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import type { Dictionary, LanguageCode } from "@/lib/i18n/dictionaries";

// Channels and API keys sit here, not under Settings: both gate whether the
// product works at all (no WhatsApp number connected = nothing sends; no
// API key = the MCP/API story doesn't work), the same reason a BSP like
// Resend surfaces Domains and API keys as flat top-level nav instead of
// burying them in an account-settings menu. Settings below is left for
// genuinely account-level configuration only.
const NAV_KEYS = [
  { href: "/dashboard", key: "overview", icon: "grid" },
  { href: "/settings/channels", key: "channels", icon: "channel" },
  { href: "/contacts", key: "contacts", icon: "users" },
  { href: "/templates", key: "templates", icon: "doc" },
  { href: "/catalog", key: "catalog", icon: "catalog" },
  { href: "/campaigns", key: "campaigns", icon: "send" },
  { href: "/inbox", key: "inbox", icon: "chat" },
  { href: "/analytics", key: "analytics", icon: "chart" },
  { href: "/flows", key: "chatbotFlows", icon: "flow" },
  { href: "/forms", key: "forms", icon: "form" },
  { href: "/automations", key: "automations", icon: "bolt" },
  { href: "/sequences", key: "sequences", icon: "flow" },
  { href: "/webhooks", key: "webhooks", icon: "webhook" },
  { href: "/settings/api-keys", key: "apiKeys", icon: "key" },
  { href: "/links", key: "linksWidget", icon: "link" },
  { href: "/agency", key: "agency", icon: "agency" },
] as const satisfies ReadonlyArray<{ href: string; key: keyof Dictionary["nav"]; icon: string }>;

const SETTINGS_NAV_KEYS = [
  { href: "/settings/billing", key: "billing" },
  { href: "/settings/team", key: "team" },
  { href: "/settings/business-hours", key: "businessHours" },
  { href: "/settings/payments", key: "payments" },
  { href: "/settings/canned-responses", key: "cannedResponses" },
  { href: "/settings/integrations", key: "integrations" },
] as const satisfies ReadonlyArray<{ href: string; key: keyof Dictionary["nav"] }>;

function Icon({ name }: { name: string }) {
  const common = { width: 17, height: 17, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "grid":
      return <svg {...common}><rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.4" /><rect x="11" y="2.5" width="6.5" height="6.5" rx="1.4" /><rect x="2.5" y="11" width="6.5" height="6.5" rx="1.4" /><rect x="11" y="11" width="6.5" height="6.5" rx="1.4" /></svg>;
    case "users":
      return <svg {...common}><circle cx="6.5" cy="6.5" r="2.6" /><circle cx="14" cy="6.5" r="2.6" /><path d="M2.3 17c0-2.8 1.9-4.4 4.2-4.4s4.2 1.6 4.2 4.4M9.3 17c0-2.8 1.9-4.4 4.2-4.4s4.2 1.6 4.2 4.4" /></svg>;
    case "doc":
      return <svg {...common}><path d="M5 2.5h7l3 3V17a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5a1 1 0 011-1z" /><path d="M12 2.5V6h3" /><path d="M6.5 10h7M6.5 13h5" /></svg>;
    case "send":
      return <svg {...common}><path d="M2 10l16-7-6 16-3-6-7-3z" /></svg>;
    case "chat":
      return <svg {...common}><path d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z" /></svg>;
    case "bolt":
      return <svg {...common}><path d="M11 2.5L4.5 11h4.2l-.7 6.5L15.5 9h-4.2l-.3-6.5z" /></svg>;
    case "webhook":
      return <svg {...common}><circle cx="5.5" cy="14.5" r="2.3" /><circle cx="14.5" cy="14.5" r="2.3" /><circle cx="13" cy="5.5" r="2.3" /><path d="M7.6 13.5L11.3 7M12.2 14.5H7.8" /></svg>;
    case "chart":
      return <svg {...common}><path d="M3 17V3M3 17h14" /><path d="M6.5 14V9.5M10 14V6M13.5 14v-3" /></svg>;
    case "link":
      return <svg {...common}><path d="M8.5 11.5a3 3 0 004.2 0l2-2a3 3 0 00-4.2-4.2l-1 1" /><path d="M11.5 8.5a3 3 0 00-4.2 0l-2 2a3 3 0 004.2 4.2l1-1" /></svg>;
    case "flow":
      return <svg {...common}><circle cx="4" cy="4" r="1.8" /><circle cx="4" cy="16" r="1.8" /><circle cx="16" cy="10" r="1.8" /><path d="M5.6 4.8L14.4 9.2M5.6 15.2L14.4 10.8" /></svg>;
    case "form":
      return <svg {...common}><rect x="3" y="2.5" width="14" height="15" rx="1.2" /><rect x="6" y="6" width="2.5" height="2.5" rx="0.5" /><path d="M10.5 7.2h6M6 12h2.5M10.5 12.2h6" /></svg>;
    case "catalog":
      return <svg {...common}><rect x="2.5" y="3" width="6" height="6" rx="1" /><rect x="11.5" y="3" width="6" height="6" rx="1" /><rect x="2.5" y="11" width="6" height="6" rx="1" /><rect x="11.5" y="11" width="6" height="6" rx="1" /></svg>;
    case "agency":
      return <svg {...common}><rect x="3" y="8" width="4.5" height="9" rx="0.8" /><rect x="8.5" y="4" width="4.5" height="13" rx="0.8" /><rect x="14" y="11" width="3" height="6" rx="0.8" /></svg>;
    case "channel":
      return <svg {...common}><path d="M10 3.5v13" /><path d="M6.3 6.8a5.3 5.3 0 017.4 0M4.2 4.6a8.3 8.3 0 0111.6 0" /><circle cx="10" cy="16.2" r="1.1" fill="currentColor" stroke="none" /></svg>;
    case "key":
      return <svg {...common}><circle cx="6.2" cy="6.2" r="3.3" /><path d="M8.5 8.5L16.5 16.5M13 13l1.8 1.8M15.3 10.7l1.8 1.8" /></svg>;
    default:
      return null;
  }
}

interface UserWorkspace {
  id: string;
  name: string;
  role: string;
}

export function Sidebar({
  workspaceId,
  workspaces,
  nav,
  lang,
}: {
  workspaceId: string;
  workspaces: UserWorkspace[];
  nav: Dictionary["nav"];
  lang: LanguageCode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-border bg-surface p-3.5">
      <div className="mb-1 flex items-center gap-2.5 px-2 py-2">
        <Logo />
        <span className="text-[15px] font-semibold tracking-tight">Sendkar</span>
      </div>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("sk:open-command-palette"))}
        className="mt-2 flex items-center justify-between rounded-md border border-border px-2.5 py-1.5 text-[12.5px] text-faint hover:border-accent-dim hover:text-muted"
      >
        <span>Jump to…</span>
        <span className="font-mono text-[11px]">⌘K</span>
      </button>

      <nav className="mt-4 flex flex-col gap-0.5">
        {NAV_KEYS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                active ? "bg-accent-glow text-foreground" : "text-muted hover:text-foreground"
              }`}
              style={active ? { background: "rgba(34,197,94,0.10)" } : undefined}
            >
              <Icon name={item.icon} />
              {nav[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-border pt-3">
        <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{nav.settings}</div>
        <nav className="flex flex-col gap-0.5">
          {SETTINGS_NAV_KEYS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
                style={active ? { background: "rgba(34,197,94,0.10)" } : undefined}
              >
                {nav[item.key]}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <LanguageSwitcher current={lang} compact />
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <WorkspaceSwitcher workspaces={workspaces} currentId={workspaceId} />
          </div>
          <button
            onClick={() => logout()}
            className="px-2 text-[11.5px] font-medium text-faint hover:text-danger"
          >
            {nav.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
