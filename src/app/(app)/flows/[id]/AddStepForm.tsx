"use client";

import { useActionState, useState } from "react";
import { addFlowStep } from "../actions";

export function AddStepForm({ flowId, nextStepOrder }: { flowId: string; nextStepOrder: number }) {
  const [state, formAction, pending] = useActionState(addFlowStep, null);
  const [open, setOpen] = useState(false);
  const [messageType, setMessageType] = useState<"text" | "buttons">("text");

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ Add step {nextStepOrder}</button>;
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <input type="hidden" name="flowId" value={flowId} />
      <div className="text-[12px] text-faint">This will be step {nextStepOrder}.</div>
      <div>
        <label className="sk-label">Message type</label>
        <select name="messageType" value={messageType} onChange={(e) => setMessageType(e.target.value as "text" | "buttons")} className="sk-input w-auto">
          <option value="text">Plain text</option>
          <option value="buttons">Tappable buttons</option>
        </select>
      </div>
      <div>
        <label className="sk-label">{messageType === "buttons" ? "Message body (shown above the buttons)" : "Message this step sends"}</label>
        <textarea name="messageBody" className="sk-input" rows={3} required />
      </div>
      {messageType === "buttons" && (
        <div>
          <label className="sk-label">Button labels (up to 3, first left blank stops the list)</label>
          <div className="flex gap-2">
            <input name="buttonLabel1" maxLength={20} className="sk-input text-[13px]" placeholder="Button 1" />
            <input name="buttonLabel2" maxLength={20} className="sk-input text-[13px]" placeholder="Button 2" />
            <input name="buttonLabel3" maxLength={20} className="sk-input text-[13px]" placeholder="Button 3" />
          </div>
        </div>
      )}
      <div>
        <label className="sk-label">Branches (one per line: keyword =&gt; step number)</label>
        <textarea name="branches" className="sk-input font-mono text-[12.5px]" rows={3} placeholder={"pricing => 2\nsupport => 3"} />
        <p className="mt-1 text-[11.5px] text-faint">If the reply contains one of these keywords, the flow jumps to that step number.</p>
      </div>
      <div>
        <label className="sk-label">Default next step (optional — used if no branch matches)</label>
        <input name="defaultNextStepOrder" type="number" min={1} className="sk-input w-32" placeholder="e.g. 2" />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Add step"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}
