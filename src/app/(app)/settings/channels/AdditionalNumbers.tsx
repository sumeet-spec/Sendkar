"use client";

import { useActionState, useState, useTransition } from "react";
import { addWhatsAppNumber, deleteWhatsAppNumber } from "./actions";

interface WhatsAppNumber {
  id: string;
  label: string;
  phone_number_id: string;
  display_number: string | null;
}

function AddNumberForm() {
  const [state, formAction, pending] = useActionState(addWhatsAppNumber, null);
  const [open, setOpen] = useState(false);

  if (!open) return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-ghost">+ Add another number</button>;

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2 rounded-md border border-border p-3">
      <input name="label" className="sk-input text-sm" placeholder="Label — e.g. Support line" required />
      <div className="grid grid-cols-2 gap-2">
        <input name="phoneNumberId" className="sk-input font-mono text-sm" placeholder="Phone number ID" required />
        <input name="wabaId" className="sk-input font-mono text-sm" placeholder="WABA ID (optional)" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="displayNumber" className="sk-input font-mono text-sm" placeholder="Display number (optional)" />
        <input name="accessToken" type="password" className="sk-input font-mono text-sm" placeholder="Access token" required />
      </div>
      {state?.error && <p className="text-[12px] text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary text-[12.5px] disabled:opacity-60">
          {pending ? "Adding…" : "Add number"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost text-[12.5px]">Cancel</button>
      </div>
    </form>
  );
}

function NumberRow({ number }: { number: WhatsAppNumber }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2">
      <div>
        <div className="text-[13px] font-medium">{number.label}</div>
        <div className="font-mono text-[11.5px] text-faint">{number.display_number ?? number.phone_number_id}</div>
      </div>
      <button disabled={pending} onClick={() => startTransition(() => deleteWhatsAppNumber(number.id))} className="text-xs text-faint hover:text-danger">
        Remove
      </button>
    </div>
  );
}

export function AdditionalNumbers({ numbers }: { numbers: WhatsAppNumber[] }) {
  return (
    <div className="sk-card p-5">
      <div className="mb-1 font-medium">Additional WhatsApp numbers</div>
      <p className="mb-3 text-[12.5px] text-faint">
        Your first number above is the default. Add more to run separate lines (e.g. sales + support) from one workspace.
      </p>
      <div className="flex flex-col gap-2">
        {numbers.map((n) => <NumberRow key={n.id} number={n} />)}
      </div>
      <div className="mt-3">
        <AddNumberForm />
      </div>
    </div>
  );
}
