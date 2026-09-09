"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface RecipientRow {
  id: string;
  contact_id: string | null;
  status: string;
  error: string | null;
  sent_at: string | null;
  contacts: { phone?: string; name?: string } | null;
}

const TABS = ["all", "queued", "sent", "delivered", "read", "failed"] as const;

const STATUS_STYLE: Record<string, string> = {
  delivered: "border-accent text-accent",
  read: "bg-accent text-[#05130a] border-accent",
  sent: "",
  queued: "text-faint",
  failed: "border-danger text-danger",
};

export function RecipientTable({
  recipients,
  campaignId,
}: {
  recipients: RecipientRow[];
  campaignId: string;
}) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: recipients.length };
    for (const r of recipients) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [recipients]);

  const filtered = useMemo(() => {
    let rows = recipients;
    if (activeTab !== "all") rows = rows.filter((r) => r.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => {
        const c = r.contacts;
        return c?.phone?.includes(q) || c?.name?.toLowerCase().includes(q);
      });
    }
    return rows;
  }, [recipients, activeTab, search]);

  return (
    <div className="sk-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {TABS.map((tab) =>
            (counts[tab] ?? 0) > 0 || tab === "all" ? (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="sk-pill flex-shrink-0 cursor-pointer text-[11.5px] capitalize"
                style={
                  activeTab === tab
                    ? { borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-glow)" }
                    : undefined
                }
              >
                {tab}
                {counts[tab] ? (
                  <span className="ml-1 font-mono tabular-nums opacity-70">{counts[tab]}</span>
                ) : null}
              </button>
            ) : null,
          )}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="var(--faint)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="5" cy="5" r="3.5" />
            <path d="M8 8l2 2" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sk-input py-1.5 pl-7 pr-3 text-[12.5px]"
            placeholder="Search by phone or name…"
            style={{ width: 220 }}
          />
        </div>

        {/* Export */}
        <a
          href={`/api/campaigns/${campaignId}/recipients`}
          download
          className="sk-btn sk-btn-ghost text-[12.5px]"
        >
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Phone", "Name", "Status", "Sent", "Error"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const contact = r.contacts;
              return (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-[var(--surface-2)]">
                  <td className="px-4 py-2.5 font-mono text-[13px]">
                    {r.contact_id ? (
                      <Link href={`/inbox/${r.contact_id}`} className="hover:text-accent">
                        {contact?.phone}
                      </Link>
                    ) : (
                      contact?.phone
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{contact?.name ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`sk-pill ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-faint">
                    {r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-danger">{r.error ?? ""}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-muted">
                  {recipients.length === 0
                    ? "No recipients yet — start the campaign to snapshot the audience."
                    : "No recipients match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {recipients.length >= 200 && (
        <div className="border-t border-border px-4 py-3 text-[12px] text-faint">
          Showing latest 200 recipients · <a href={`/api/campaigns/${campaignId}/recipients`} download className="text-accent hover:text-accent-hover">Export CSV for full list</a>
        </div>
      )}
    </div>
  );
}
