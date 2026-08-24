"use client";

import { useActionState, useState } from "react";
import { addWaFlowScreen } from "../actions";

export function AddScreenForm({ waFlowId }: { waFlowId: string }) {
  const [state, formAction, pending] = useActionState(addWaFlowScreen, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ Add screen</button>;
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <input type="hidden" name="waFlowId" value={waFlowId} />
      <div>
        <label className="sk-label">Screen title</label>
        <input name="title" className="sk-input" placeholder="Tell us about your order" required />
      </div>
      <div>
        <label className="sk-label">Fields — one per line</label>
        <textarea
          name="fields"
          className="sk-input font-mono text-[12.5px]"
          rows={5}
          placeholder={"heading: Quick order form\nbody: Takes under a minute\ntext: Your name *\nradio: Size | Small, Medium, Large *\ncheckbox: Add-ons | Gift wrap, Express shipping"}
          required
        />
        <p className="mt-1 text-[11.5px] text-faint">
          Types: heading, body (display only), text (short answer), textarea (long answer), radio, checkbox
          (add options after a <span className="font-mono">|</span>, comma-separated). End a label with{" "}
          <span className="font-mono">*</span> to require it.
        </p>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Add screen"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}
