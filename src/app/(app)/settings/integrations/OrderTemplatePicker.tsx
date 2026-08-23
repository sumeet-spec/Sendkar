"use client";

import { useActionState } from "react";
import { setOrderConfirmationTemplate } from "./actions";

interface Template {
  id: string;
  name: string;
  language: string;
}

export function OrderTemplatePicker({ templates, currentId }: { templates: Template[]; currentId: string | null }) {
  const [state, formAction, pending] = useActionState(setOrderConfirmationTemplate, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="mb-1 font-medium">Order confirmation template</div>
      <p className="mb-3 text-[12.5px] text-faint">Used by both Shopify and WooCommerce when a new order comes in.</p>
      <div className="flex gap-2">
        <select name="templateId" defaultValue={currentId ?? ""} className="sk-input flex-1 text-sm">
          <option value="">None — don&apos;t auto-send</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "…" : "Save"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-[12.5px] text-danger">{state.error}</p>}
    </form>
  );
}
