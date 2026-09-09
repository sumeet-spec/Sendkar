"use client";

import { useActionState, useState } from "react";
import { saveAiAgent } from "./actions";

const MAX_KNOWLEDGE = 4000;

export function AiAgentForm({
  initialEnabled,
  initialKnowledge,
  planAllowed,
}: {
  initialEnabled: boolean;
  initialKnowledge: string;
  planAllowed: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAiAgent, null);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const charsLeft = MAX_KNOWLEDGE - knowledge.length;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {!planAllowed && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-[12.5px] text-foreground">
          The AI agent requires the <a href="/settings/billing" className="text-accent hover:underline">Growth plan or above</a> — every reply it sends is a real AI request.
        </div>
      )}

      {/* Toggle row */}
      <div className="sk-card flex items-center justify-between p-4">
        <div className="pr-4">
          <div className="font-medium">Auto-reply agent</div>
          <p className="mt-0.5 text-[12.5px] text-faint">
            Replies automatically when no flow or keyword automation matched first. Rounds the clock — no human needed.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={!planAllowed}
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40 ${
            enabled ? "bg-accent" : "bg-border"
          }`}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ left: enabled ? "22px" : "2px" }}
          />
        </button>
        <input type="hidden" name="enabled" value={enabled ? "on" : ""} />
      </div>

      {/* Knowledge base */}
      <div className="sk-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="font-medium" htmlFor="knowledge">Business knowledge</label>
          <span className={`text-[11.5px] ${charsLeft < 200 ? "text-warn" : "text-faint"}`}>
            {charsLeft.toLocaleString()} chars left
          </span>
        </div>
        <p className="mb-2 text-[12px] text-faint">
          The agent only answers from what you write here. If a question isn&apos;t covered, it tells the customer a team member will follow up — it never guesses.
        </p>
        <textarea
          id="knowledge"
          name="knowledge"
          rows={10}
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value.slice(0, MAX_KNOWLEDGE))}
          disabled={!planAllowed}
          placeholder={`Describe your business, prices, policies and FAQs.\n\nExample:\nWe are Priya Textiles, a saree and fabric shop in Surat. We ship all over India in 3–5 days. Returns accepted within 7 days if unworn. No international shipping yet. Cash on delivery available for orders under ₹2,000.`}
          className="sk-input font-mono text-[12.5px] leading-relaxed disabled:opacity-50"
        />
        <p className="mt-1 text-[11px] text-faint">
          Tip: Include your hours, return policy, shipping times, and 5–10 common questions your team already answers every day.
        </p>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">Settings saved.</p>}

      <div className="flex">
        <button type="submit" disabled={pending || !planAllowed} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
