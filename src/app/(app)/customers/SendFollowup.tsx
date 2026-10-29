"use client";

import { useState, useTransition } from "react";
import type { FollowUi } from "@/lib/i18n/followUi";
import { sendFollowupNow } from "../bills/followupActions";

export function SendFollowup({ t, contactId, templates }: { t: FollowUi; contactId: string; templates: Array<{ id: string; label: string }> }) {
  const [id, setId] = useState("");
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select value={id} onChange={(e) => setId(e.target.value)} className="sk-input w-auto max-w-[260px] text-[13px]">
        <option value="">{t.pickMessage}</option>
        {templates.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
      </select>
      <button
        type="button" disabled={!id || pending} className="sk-btn text-[13px] disabled:opacity-50"
        onClick={() => { setNote(null); startTransition(async () => { const r = await sendFollowupNow(contactId, id); setNote(r.error ? { text: r.error, error: true } : { text: t.sentNow, error: false }); }); }}
      >
        {t.sendNow}
      </button>
      {note && <span className={`text-[12px] ${note.error ? "text-danger" : "text-accent"}`}>{note.text}</span>}
    </div>
  );
}
