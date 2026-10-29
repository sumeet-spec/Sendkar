"use client";

import { useActionState, useState } from "react";
import { addSequenceStep } from "../actions";

export interface TemplateChoice {
  id: string;
  name: string;
  language: string;
  body_text: string | null;
  status: string;
}

const SALE_FIELDS = [
  { value: "name", label: "Customer name" },
  { value: "ctx:amount_display", label: "Sale amount" },
  { value: "ctx:bill", label: "Bill / order number" },
];

export function AddStepForm({ sequenceId, templates, saleTriggered }: { sequenceId: string; templates: TemplateChoice[]; saleTriggered: boolean }) {
  const [state, formAction, pending] = useActionState(addSequenceStep, null);
  const [useTemplate, setUseTemplate] = useState(templates.length > 0);
  const [templateId, setTemplateId] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const selected = templates.find((t) => t.id === templateId);
  const slots = [...new Set(selected?.body_text?.match(/\{\{(\d+)\}\}/g) ?? [])].map((p) => p.replace(/[{}]/g, ""));
  const mappingComplete = slots.every((slot) => {
    const v = mapping[slot];
    return Boolean(v) && (!v.startsWith("text:") || v.slice(5).trim().length > 0);
  });
  const canSubmit = useTemplate ? Boolean(selected) && mappingComplete : true;

  function pickTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    const s = [...new Set(t?.body_text?.match(/\{\{(\d+)\}\}/g) ?? [])].map((p) => p.replace(/[{}]/g, ""));
    setMapping(s.length ? { [s[0]]: "name" } : {});
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-4">
      <input type="hidden" name="sequenceId" value={sequenceId} />
      <input type="hidden" name="templateId" value={useTemplate ? templateId : ""} />
      <input type="hidden" name="variableMapping" value={useTemplate ? JSON.stringify(mapping) : ""} />

      <div>
        <label className="sk-label">Send after</label>
        <div className="flex items-center gap-2">
          <input name="delayValue" type="number" min={0} defaultValue={0} className="sk-input w-24" />
          <select name="delayUnit" defaultValue="days" className="sk-input w-28">
            <option value="minutes">minutes</option>
            <option value="hours">hours</option>
            <option value="days">days</option>
          </select>
          <span className="text-[12px] text-faint">after the previous step (0 = straight away)</span>
        </div>
      </div>

      <div className="flex gap-4 text-[13px]">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={useTemplate} onChange={() => setUseTemplate(true)} disabled={templates.length === 0} /> Approved template
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={!useTemplate} onChange={() => setUseTemplate(false)} /> Plain message
        </label>
      </div>

      {useTemplate ? (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-faint">
            Templates reach the customer at any time, even weeks after their last message — use one for every step that
            isn&apos;t sent straight away.
          </p>
          <select className="sk-input" value={templateId} onChange={(e) => pickTemplate(e.target.value)} required>
            <option value="">Choose a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}{t.status !== "approved" ? ` — ${t.status}` : ""}</option>
            ))}
          </select>
          {selected && <div className="rounded-md border border-border p-2.5 text-[12.5px] text-muted">{selected.body_text}</div>}
          {selected?.status === "pending" && (
            <p className="text-[12px] text-faint">Waiting for Meta to approve this one. The step will wait and send once it is approved.</p>
          )}
          {slots.map((slot) => {
            const value = mapping[slot] ?? "";
            const isText = value.startsWith("text:");
            return (
              <div key={slot} className="flex items-start gap-3">
                <code className="mt-1.5 flex-shrink-0 rounded px-2 py-1 text-[12px] font-semibold" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>{`{{${slot}}}`}</code>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <select
                    className="sk-input text-[13px]"
                    value={isText ? "text" : value}
                    onChange={(e) => setMapping((prev) => ({ ...prev, [slot]: e.target.value === "text" ? "text:" : e.target.value }))}
                  >
                    <option value="">Choose what goes here…</option>
                    {SALE_FIELDS.filter((f) => saleTriggered || f.value === "name").map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    <option value="text">Same text for everyone…</option>
                  </select>
                  {isText && (
                    <input
                      className="sk-input text-[13px]"
                      maxLength={200}
                      placeholder="e.g. your shop name"
                      value={value.slice(5)}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [slot]: `text:${e.target.value}` }))}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <label className="sk-label">Message</label>
          <textarea name="messageBody" required rows={2} className="sk-input" placeholder="Still want this? {{amount}} — {{checkout_url}}" />
          <p className="mt-1 text-[11.5px] text-faint">
            Plain messages only reach customers who wrote to you in the last 24 hours. {"{{amount}}"} and {"{{checkout_url}}"} fill in from a cart or order.
          </p>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="includePaymentLink" className="h-4 w-4 accent-[var(--accent)]" />
            Attach a payment link to this step
          </label>
        </div>
      )}

      <button type="submit" disabled={pending || !canSubmit} className="sk-btn sk-btn-primary self-start disabled:opacity-60">
        {pending ? "Adding…" : "Add step"}
      </button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
