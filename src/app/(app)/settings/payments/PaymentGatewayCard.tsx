"use client";

import { useActionState } from "react";

interface Field {
  name: string;
  placeholder: string;
}

export function PaymentGatewayCard({
  title, description, configured, fields, saveAction, disconnectAction,
}: {
  title: string;
  description: string;
  configured: boolean;
  fields: Field[];
  saveAction: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  disconnectAction: () => Promise<void | { error?: string }>;
}) {
  const [state, formAction, pending] = useActionState(saveAction, null);

  return (
    <div className="sk-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-medium">{title}</div>
        {configured && <span className="sk-pill border-accent text-accent">Connected</span>}
      </div>
      <p className="mb-3 text-[12.5px] text-faint">{description}</p>
      <form action={formAction} className="flex flex-col gap-2">
        {fields.map((f) => (
          <input key={f.name} name={f.name} type="password" className="sk-input text-sm" placeholder={f.placeholder} />
        ))}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
            {pending ? "…" : "Save"}
          </button>
          {configured && (
            <button type="button" onClick={() => disconnectAction()} className="sk-btn sk-btn-ghost">
              Disconnect
            </button>
          )}
        </div>
        {state?.error && <p className="text-[12.5px] text-danger">{state.error}</p>}
        {state?.success && <p className="text-[12.5px] text-accent">Saved.</p>}
      </form>
    </div>
  );
}
