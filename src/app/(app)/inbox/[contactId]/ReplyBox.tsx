"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { replyToContact, draftReplySuggestion, sendProductToContact, sendTypingIndicator, sendButtonsToContact } from "../actions";

interface CannedResponse {
  id: string;
  shortcut: string;
  body: string;
}

interface Product {
  id: string;
  name: string;
  price_label: string | null;
}

export function ReplyBox({
  contactId,
  sessionOpen,
  cannedResponses,
  products,
}: {
  contactId: string;
  sessionOpen: boolean;
  cannedResponses: CannedResponse[];
  products: Product[];
}) {
  const [state, formAction, pending] = useActionState(replyToContact, null);
  const [aiPending, startAiTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);
  const [productPending, startProductTransition] = useTransition();
  const [productError, setProductError] = useState<string | null>(null);
  const [buttonsOpen, setButtonsOpen] = useState(false);
  const [buttonLabels, setButtonLabels] = useState(["", "", ""]);
  const [buttonsBody, setButtonsBody] = useState("");
  const [buttonsPending, startButtonsTransition] = useTransition();
  const [buttonsError, setButtonsError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const typingFiredRef = useRef(false);

  useEffect(() => {
    // Fire once per thread visit, not on every re-render — the customer
    // only needs to see "typing…" once when someone actually opens the chat.
    if (typingFiredRef.current || !sessionOpen) return;
    typingFiredRef.current = true;
    sendTypingIndicator(contactId);
  }, [contactId, sessionOpen]);

  function sendButtons() {
    setButtonsError(null);
    const buttons = buttonLabels
      .map((title, i) => ({ id: `btn_${i + 1}`, title: title.trim() }))
      .filter((b) => b.title);
    startButtonsTransition(async () => {
      const result = await sendButtonsToContact(contactId, buttonsBody, buttons);
      if (result.error) {
        setButtonsError(result.error);
        return;
      }
      setButtonsOpen(false);
      setButtonsBody("");
      setButtonLabels(["", "", ""]);
    });
  }

  function draftWithAi() {
    setAiError(null);
    startAiTransition(async () => {
      const result = await draftReplySuggestion(contactId);
      if (result.error) {
        setAiError(result.error);
        return;
      }
      if (result.text && textRef.current) textRef.current.value = result.text;
    });
  }

  function insertCanned(id: string) {
    const canned = cannedResponses.find((c) => c.id === id);
    if (canned && textRef.current) textRef.current.value = canned.body;
  }

  function sendProduct(productId: string) {
    setProductError(null);
    startProductTransition(async () => {
      const result = await sendProductToContact(contactId, productId);
      if (result.error) setProductError(result.error);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border p-4">
      <input type="hidden" name="contactId" value={contactId} />
      {!sessionOpen && (
        <p className="text-[12.5px] text-warn">
          The 24h reply window is closed — free-text replies will fail. Send a template message from Campaigns instead,
          or wait for the contact to message again.
        </p>
      )}
      <textarea
        ref={textRef}
        name="body"
        rows={2}
        placeholder="Reply — only deliverable within 24h of their last message"
        className="sk-input resize-none"
        required
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {aiError && <p className="text-sm text-danger">{aiError}</p>}
      {productError && <p className="text-sm text-danger">{productError}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={draftWithAi} disabled={aiPending} className="sk-btn sk-btn-ghost disabled:opacity-60">
            {aiPending ? "Drafting…" : "✳ Draft with AI"}
          </button>
          {cannedResponses.length > 0 && (
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) insertCanned(e.target.value);
                e.target.value = "";
              }}
              className="sk-input w-auto text-[12.5px]"
            >
              <option value="" disabled>Insert canned reply…</option>
              {cannedResponses.map((c) => (
                <option key={c.id} value={c.id}>/{c.shortcut}</option>
              ))}
            </select>
          )}
          {products.length > 0 && (
            <select
              defaultValue=""
              disabled={productPending || !sessionOpen}
              onChange={(e) => {
                if (e.target.value) sendProduct(e.target.value);
                e.target.value = "";
              }}
              className="sk-input w-auto text-[12.5px] disabled:opacity-60"
            >
              <option value="" disabled>{productPending ? "Sending…" : "Send product…"}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.price_label ? ` (${p.price_label})` : ""}</option>
              ))}
            </select>
          )}
          <button type="button" onClick={() => setButtonsOpen((v) => !v)} disabled={!sessionOpen} className="sk-btn sk-btn-ghost disabled:opacity-60">
            ▭ Buttons
          </button>
        </div>
        <button type="submit" disabled={pending || !sessionOpen} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Sending…" : "Send"}
        </button>
      </div>

      {buttonsOpen && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-2 p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Send up to 3 tappable buttons</div>
          <input
            value={buttonsBody}
            onChange={(e) => setButtonsBody(e.target.value)}
            className="sk-input text-[13px]"
            placeholder={'Message body, e.g. "Want us to hold your order?"'}
          />
          <div className="flex gap-2">
            {buttonLabels.map((label, i) => (
              <input
                key={i}
                value={label}
                onChange={(e) => setButtonLabels((prev) => prev.map((l, idx) => (idx === i ? e.target.value : l)))}
                maxLength={20}
                className="sk-input text-[12.5px]"
                placeholder={`Button ${i + 1}`}
              />
            ))}
          </div>
          {buttonsError && <p className="text-[12px] text-danger">{buttonsError}</p>}
          <button type="button" onClick={sendButtons} disabled={buttonsPending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">
            {buttonsPending ? "Sending…" : "Send buttons"}
          </button>
        </div>
      )}
    </form>
  );
}
