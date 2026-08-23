"use client";

import { useActionState, useState } from "react";
import { createProduct } from "./actions";

export function NewProductForm() {
  const [state, formAction, pending] = useActionState(createProduct, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ Add product</button>;
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Retailer ID (must match Meta catalog exactly)</label>
          <input name="retailerId" className="sk-input font-mono text-sm" placeholder="sku_1029" required />
        </div>
        <div>
          <label className="sk-label">Name</label>
          <input name="name" className="sk-input" placeholder="Classic tee — black" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Price label</label>
          <input name="priceLabel" className="sk-input" placeholder="₹899" />
        </div>
        <div>
          <label className="sk-label">Image URL</label>
          <input name="imageUrl" className="sk-input" placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className="sk-label">Description</label>
        <textarea name="description" className="sk-input" rows={2} />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}
