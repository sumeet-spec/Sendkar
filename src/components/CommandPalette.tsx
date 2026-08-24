"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface Command {
  label: string;
  href: string;
  group: string;
}

/**
 * ⌘K / Ctrl+K — the single most consistent "this feels like a modern
 * platform" signal across Linear/Vercel/GitHub/Slack/Raycast. Nav-only in
 * this first pass (no live contact/campaign search yet) — still real
 * value: every admin action here is a handful of pages visited daily, and
 * jumping straight to one beats hunting the sidebar every time.
 */
export function CommandPalette({ nav }: { nav: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const commands: Command[] = useMemo(
    () => [
      { label: nav.overview, href: "/dashboard", group: nav.overview },
      { label: nav.contacts, href: "/contacts", group: "" },
      { label: nav.templates, href: "/templates", group: "" },
      { label: nav.catalog, href: "/catalog", group: "" },
      { label: nav.campaigns, href: "/campaigns", group: "" },
      { label: nav.inbox, href: "/inbox", group: "" },
      { label: nav.analytics, href: "/analytics", group: "" },
      { label: nav.chatbotFlows, href: "/flows", group: "" },
      { label: nav.forms, href: "/forms", group: "" },
      { label: nav.automations, href: "/automations", group: "" },
      { label: nav.webhooks, href: "/webhooks", group: "" },
      { label: nav.linksWidget, href: "/links", group: "" },
      { label: nav.agency, href: "/agency", group: "" },
      { label: nav.billing, href: "/settings/billing", group: nav.settings },
      { label: nav.team, href: "/settings/team", group: nav.settings },
      { label: nav.channels, href: "/settings/channels", group: nav.settings },
      { label: nav.cannedResponses, href: "/settings/canned-responses", group: nav.settings },
      { label: nav.apiKeys, href: "/settings/api-keys", group: nav.settings },
      { label: nav.integrations, href: "/settings/integrations", group: nav.settings },
    ],
    [nav],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelected(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenEvent() {
      setOpen(true);
      setQuery("");
      setSelected(0);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("sk:open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("sk:open-command-palette", onOpenEvent);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="sk-card w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSelected((i) => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter" && filtered[selected]) { go(filtered[selected].href); }
          }}
          placeholder="Jump to…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-[14px] outline-none placeholder:text-faint"
        />
        <div className="max-h-80 overflow-y-auto p-1.5">
          {filtered.map((c, i) => (
            <button
              key={c.href}
              onClick={() => go(c.href)}
              onMouseEnter={() => setSelected(i)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13.5px] ${
                i === selected ? "bg-accent-glow text-foreground" : "text-muted"
              }`}
              style={i === selected ? { background: "rgba(34,197,94,0.10)" } : undefined}
            >
              <span>{c.label}</span>
              {c.group && <span className="text-[11px] text-faint">{c.group}</span>}
            </button>
          ))}
          {filtered.length === 0 && <p className="px-3 py-4 text-center text-[13px] text-faint">No matches.</p>}
        </div>
      </div>
    </div>
  );
}
