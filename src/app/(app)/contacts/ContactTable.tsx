"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { bulkTagContacts } from "./actions";
import { formatCurrency } from "@/lib/dashboardMetrics";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import type { ContactsUi } from "@/lib/i18n/contactsCopy";

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

// The languages the app writes in use their own names; the rest keep English names.
const LANGUAGE_LABEL: Record<string, string> = {
  ar: "Arabic", es: "Spanish", pt_BR: "Portuguese", id: "Indonesian", bn: "Bengali", pa: "Punjabi", ur: "Urdu",
  ...Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label])),
};

export function ContactTable({ t, contacts, currency }: { t: ContactsUi; contacts: ContactRow[]; currency: string }) {
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
      setTagResult(result.error ? result.error : (tagAction === "add" ? t.tagAdded : t.tagRemoved).replace("{tag}", tagInput.trim()).replace("{n}", String(selected.size)));
      if (!result.error) { setSelected(new Set()); setTagInput(""); }
    });
  }

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-accent/30 bg-[var(--accent-glow)] px-4 py-2.5">
          <span className="text-[13px] font-medium">{t.selected.replace("{n}", String(selected.size))}</span>
          <div className="flex flex-1 items-center gap-2">
            <select
              value={tagAction}
              onChange={(e) => setTagAction(e.target.value as "add" | "remove")}
              className="sk-input w-28 py-1 text-[12.5px]"
            >
              <option value="add">{t.addTag}</option>
              <option value="remove">{t.removeTag}</option>
            </select>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyBulkTag()}
              className="sk-input flex-1 py-1 text-[12.5px]"
              placeholder={t.tagPh}
            />
            <button
              disabled={tagPending || !tagInput.trim()}
              onClick={applyBulkTag}
              className="sk-btn sk-btn-primary py-1 text-[12.5px] disabled:opacity-60"
            >
              {tagPending ? t.applying : t.apply}
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} className="text-[12px] text-faint hover:text-foreground">
            {t.clear}
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
                {[t.colPhone, t.colName, t.colLanguage, t.colTags, t.colSource, t.colSpend, t.colAdded].map((h) => (
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
                    <Link href={`/inbox/${c.id}`} prefetch={false} className="hover:text-accent">
                      {c.phone}
                    </Link>
                    {c.opted_out && <span className="sk-pill ml-2 border-danger text-danger">{t.optedOutPill}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    <Link href={`/inbox/${c.id}`} prefetch={false} className="hover:text-accent">
                      {c.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="sk-pill">{LANGUAGE_LABEL[c.language ?? ""] ?? c.language ?? "—"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((tg) => <span key={tg} className="sk-pill">{tg}</span>)}
                      {c.tags.length === 0 && <span className="text-faint">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-faint">
                    {c.source}
                    {c.ad_headline && <div className="mt-0.5 text-[11px] text-accent">{t.viaAd.replace("{headline}", c.ad_headline)}</div>}
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
                    {t.noMatch}
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
