"use client";

import { useActionState, useState, useTransition } from "react";
import { addWhatsAppNumber, deleteWhatsAppNumber } from "./actions";
import type { ChannelsUi } from "@/lib/i18n/channelsCopy";

interface WhatsAppNumber {
  id: string;
  label: string;
  phone_number_id: string;
  display_number: string | null;
}

function AddNumberForm({ t }: { t: ChannelsUi }) {
  const [state, formAction, pending] = useActionState(addWhatsAppNumber, null);
  const [open, setOpen] = useState(false);

  if (!open) return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-ghost">{t.addAnother}</button>;

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2 rounded-md border border-border p-3">
      <input name="label" className="sk-input text-sm" placeholder={t.labelPh} required />
      <div className="grid grid-cols-2 gap-2">
        <input name="phoneNumberId" className="sk-input font-mono text-sm" placeholder={t.phoneNumberId} required />
        <input name="wabaId" className="sk-input font-mono text-sm" placeholder={t.wabaPh} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="displayNumber" className="sk-input font-mono text-sm" placeholder={t.displayPh} />
        <input name="accessToken" type="password" className="sk-input font-mono text-sm" placeholder={t.tokenPh} required />
      </div>
      {state?.error && <p className="text-[12px] text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary text-[12.5px] disabled:opacity-60">
          {pending ? t.adding : t.addNumber}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost text-[12.5px]">{t.cancel}</button>
      </div>
    </form>
  );
}

function NumberRow({ t, number }: { t: ChannelsUi; number: WhatsAppNumber }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2">
      <div>
        <div className="text-[13px] font-medium">{number.label}</div>
        <div className="font-mono text-[11.5px] text-faint">{number.display_number ?? number.phone_number_id}</div>
      </div>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(t.confirmRemove.replace("{label}", number.label))) {
            startTransition(async () => { await deleteWhatsAppNumber(number.id); });
          }
        }}
        className="text-xs text-faint hover:text-danger"
      >
        {t.remove}
      </button>
    </div>
  );
}

export function AdditionalNumbers({ t, numbers }: { t: ChannelsUi; numbers: WhatsAppNumber[] }) {
  return (
    <div className="sk-card p-5">
      <div className="mb-1 font-medium">{t.extraTitle}</div>
      <p className="mb-3 text-[12.5px] text-faint">{t.extraHelp}</p>
      <div className="flex flex-col gap-2">
        {numbers.map((n) => <NumberRow key={n.id} t={t} number={n} />)}
      </div>
      <div className="mt-3">
        <AddNumberForm t={t} />
      </div>
    </div>
  );
}
