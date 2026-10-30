"use client";

import { useActionState, useState, useTransition } from "react";
import type { PaySettingsUi } from "@/lib/i18n/settingsCopy";

interface Field {
  name: string;
  placeholder: string;
}

export function PaymentGatewayCard({
  t, title, description, configured, fields, saveAction, disconnectAction,
}: {
  t: PaySettingsUi;
  title: string;
  description: string;
  configured: boolean;
  fields: Field[];
  saveAction: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  disconnectAction: () => Promise<void | { error?: string }>;
}) {
  const [state, formAction, pending] = useActionState(saveAction, null);
  const [disconnectPending, startDisconnect] = useTransition();
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  return (
    <div className="sk-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-medium">{title}</div>
        {configured && <span className="sk-pill border-accent text-accent">{t.connected}</span>}
      </div>
      <p className="mb-3 text-[12.5px] text-faint">{description}</p>
      <form action={formAction} className="flex flex-col gap-2">
        {fields.map((f) => (
          <input key={f.name} name={f.name} type="password" className="sk-input text-sm" placeholder={f.placeholder} />
        ))}
        <div className="flex gap-2">
          <button type="submit" disabled={pending || disconnectPending} className="sk-btn sk-btn-primary disabled:opacity-60">
            {pending ? "…" : t.save}
          </button>
          {configured && (
            <button
              type="button"
              disabled={disconnectPending || pending}
              onClick={() => {
                if (confirm(t.confirmDisconnect.replace("{name}", title))) {
                  setDisconnectError(null);
                  startDisconnect(async () => {
                    const result = await disconnectAction();
                    if (result && "error" in result && result.error) setDisconnectError(result.error);
                  });
                }
              }}
              className="sk-btn sk-btn-ghost disabled:opacity-60"
            >
              {disconnectPending ? t.disconnecting : t.disconnect}
            </button>
          )}
        </div>
        {state?.error && <p className="text-[12.5px] text-danger">{state.error}</p>}
        {state?.success && <p className="text-[12.5px] text-accent">{t.saved}</p>}
        {disconnectError && <p className="text-[12.5px] text-danger">{disconnectError}</p>}
      </form>
    </div>
  );
}
