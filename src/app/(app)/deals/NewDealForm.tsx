"use client";

import { useActionState, useEffect, useState } from "react";
import { createDeal } from "./actions";

export function NewDealForm({ contacts }: { contacts: Array<{ id: string; name: string | null; phone: string }> }) {
  const [state, formAction, pending] = useActionState(createDeal, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ New deal</button>;
  }

  return (
    <form action={formAction} className="sk-card flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[160px] flex-1">
        <label className="sk-label">Deal name</label>
        <input name="title" className="sk-input" placeholder="e.g. Bulk saree order" required />
      </div>
      <div className="w-32">
        <label className="sk-label">Value (₹)</label>
        <input name="value" type="number" min={0} className="sk-input" placeholder="0" />
      </div>
      <div className="min-w-[160px] flex-1">
        <label className="sk-label">Contact (optional)</label>
        <select name="contactId" className="sk-input">
          <option value="">None</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name || c.phone}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Adding…" : "Add"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
