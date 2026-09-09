"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { bulkTagContacts } from "./actions";
import { formatCurrency } from "@/lib/dashboardMetrics";

export interface ContactRow {
  id: string;
  phone: string;
  name: string | null;
  language: string | null;
  source: string | null;
  tags: string[];
  opted_out: boolean;
  ad_headline: string | null;
  created_at: string;
  spend: number;
}

const LANGUAGE_LABEL: Record<string, string> = {
  hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", en: "English",
  ar: "Arabic", es: "Spanish", pt_BR: "Portuguese", id: "Indonesian", bn: "Bengali",
  gu: "Gujarati", pa: "Punjabi", ur: "Urdu",
};

export function ContactTable({ contacts, currency }: { contacts: ContactRow[]; currency: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagInput, setTagInput] = useState("");
  const [tagPending, startTagTransition] = useTransition();
  const [tagAction, setTagAction] = useState<"add" | "remove">("add");
  const [tagResult, setTagResult] = useState<string | null>(null);

  const allIds = useMemo(() => contacts.map((c) => c.id), [contacts]);
  const allSelected = selected.size === contacts.length && contacts.length > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyBulkTag() {
    if (!tagInput.trim() || selected.size === 0) return;
    startTagTransition(async () => {
      const result = await bulkTagContacts([...selected], tagInput.trim(), tagAction);
      setTagResult(result.error ? result.error : `${tagAction === "add" ? "Added" : "Removed"} tag "${tagInput.trim()}" on ${selected.size} contact${selected.size === 1 ? "" : "s"}.`);
      if (!result.error) { setSelected(new Set()); setTagInput(""); }
    });
  }

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-accent/30 bg-[var(--accent-glow)] px-4 py-2.5">
          <span className="text-[13px] font-medium">{selected.size} selected</span>
          <div className="flex flex-1 items-center gap-2">
            <select
              value={tagAction}
              onChange={(e) => setTagAction(e.target.value as "add" | "remove")}
              className="sk-input w-28 py-1 text-[12.5px]"
            >
              <option value="add">Add tag</option>
              <option value="remove">Remove tag</option>
            </select>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyBulkTag()}
              className="sk-input flex-1 py-1 text-[12.5px]"
              placeholder="Tag name…"
            />
            <button
              disabled={tagPending || !tagInput.trim()}
              onClick={applyBulkTag}
              className="sk-btn sk-btn-primary py-1 text-[12.5px] disabled:opacity-60"
            >
              {tagPending ? "Applying…" : "Apply"}
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} className="text-[12px] text-faint hover:text-foreground">
            Clear
          </button>
        </div>
      )}
      {tagResult && (
        <p className="mb-2 text-[12.5px] text-accent">{tagResult}</p>
      )}

      <div className="sk-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-accent" />
                </th>
                {["Phone", "Name", "Language", "Tags", "Source", "Spend", "Added"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-[var(--surface-2)]"
                  style={selected.has(c.id) ? { background: "var(--accent-glow)" } : undefined}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      className="accent-accent"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[13px]">
                    <Link href={`/inbox/${c.id}`} className="hover:text-accent">
                      {c.phone}
                    </Link>
                    {c.opted_out && <span className="sk-pill ml-2 border-danger text-danger">opted out</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    <Link href={`/inbox/${c.id}`} className="hover:text-accent">
                      {c.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="sk-pill">{LANGUAGE_LABEL[c.language ?? ""] ?? c.language ?? "—"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => <span key={t} className="sk-pill">{t}</span>)}
                      {c.tags.length === 0 && <span className="text-faint">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-faint">
                    {c.source}
                    {c.ad_headline && <div className="mt-0.5 text-[11px] text-accent">via ad: {c.ad_headline}</div>}
                  </td>
                  <td className="px-4 py-2.5">
                    {c.spend > 0 ? (
                      <span className="font-mono text-[13px] font-semibold tabular-nums text-accent">
                        {formatCurrency(c.spend, currency)}
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-faint">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    No contacts match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
