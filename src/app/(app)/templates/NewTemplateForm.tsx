"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { createTemplate, generateTemplateWithAi } from "./actions";

const LANGUAGES = [
  { value: "ar", label: "Arabic" },
  { value: "bn", label: "Bengali" },
  { value: "en", label: "English" },
  { value: "gu", label: "Gujarati" },
  { value: "hi", label: "Hindi" },
  { value: "id", label: "Indonesian" },
  { value: "kn", label: "Kannada" },
  { value: "mr", label: "Marathi" },
  { value: "pa", label: "Punjabi" },
  { value: "pt_BR", label: "Portuguese (Brazil)" },
  { value: "es", label: "Spanish" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "ur", label: "Urdu" },
];

const BODY_MAX = 1024;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function resolveBodyPreview(body: string) {
  return body.replace(/\{\{(\d+)\}\}/g, (_, n) => (n === "1" ? "Priya" : `[var${n}]`));
}

function WhatsAppPreview({
  headerType, headerText, bodyText, footerText, quickReplies,
}: {
  headerType: string;
  headerText: string;
  bodyText: string;
  footerText: string;
  quickReplies: string;
}) {
  const buttons = quickReplies.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const preview = resolveBodyPreview(bodyText);

  return (
    <div className="flex-shrink-0" style={{ width: 240 }}>
      <div className="text-[10.5px] font-medium uppercase tracking-wide text-faint mb-2">Preview</div>
      {/* Phone frame */}
      <div className="relative mx-auto rounded-[28px] border-[3px] bg-[#111] p-1.5" style={{ borderColor: "#333", width: 200 }}>
        {/* Screen */}
        <div className="overflow-hidden rounded-[22px]" style={{ background: "#e5ddd5" }}>
          {/* WhatsApp header bar */}
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#075e54" }}>
            <div className="h-6 w-6 rounded-full bg-white/20" />
            <div>
              <div className="text-[10px] font-semibold text-white">Business</div>
              <div className="text-[8px] text-white/70">online</div>
            </div>
          </div>

          {/* Message bubble */}
          <div className="p-2">
            <div className="max-w-[90%] overflow-hidden rounded-lg rounded-tl-none shadow-sm" style={{ background: "white" }}>
              {headerType === "image" && (
                <div className="flex h-20 items-center justify-center" style={{ background: "#ddd" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.5">
                    <rect x="2" y="4" width="16" height="12" rx="2" /><circle cx="7" cy="8" r="1.5" />
                    <path d="M2 14l5-5 3 3 2-2 6 5" />
                  </svg>
                </div>
              )}
              {headerType === "text" && headerText && (
                <div className="border-b border-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-800">
                  {headerText || "Header text"}
                </div>
              )}
              <div className="px-2.5 py-2">
                {preview ? (
                  <p className="text-[10.5px] leading-snug text-gray-800" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {preview}
                  </p>
                ) : (
                  <p className="text-[10.5px] italic text-gray-400">Message body…</p>
                )}
                {footerText && (
                  <p className="mt-1 text-[9.5px] text-gray-400">{footerText}</p>
                )}
                <div className="mt-1 text-right text-[8.5px] text-gray-400">9:41 AM ✓✓</div>
              </div>
              {buttons.length > 0 && (
                <div className="border-t border-gray-100">
                  {buttons.map((b, i) => (
                    <div key={i} className="border-b border-gray-100 px-2.5 py-1.5 text-center text-[10px] font-medium last:border-0" style={{ color: "#128c7e" }}>
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewTemplateForm({ canSubmitToMeta, workspaceId }: { canSubmitToMeta: boolean; workspaceId: string }) {
  const [state, formAction, pending] = useActionState(createTemplate, null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [metaName, setMetaName] = useState("");
  const [metaNameEdited, setMetaNameEdited] = useState(false);
  const [headerType, setHeaderType] = useState("none");
  const [headerText, setHeaderText] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [quickReplies, setQuickReplies] = useState("");
  const [isCarousel, setIsCarousel] = useState(false);

  const [aiDescription, setAiDescription] = useState("");
  const [aiPending, startAiTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);

  const [imgDescription, setImgDescription] = useState("");
  const [imgPending, setImgPending] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  // Auto-derive meta name from internal name unless user has manually edited it
  useEffect(() => {
    if (!metaNameEdited) setMetaName(slugify(name));
  }, [name, metaNameEdited]);

  async function generateImage() {
    if (!imgDescription.trim()) { setImgError("Describe what the image should show."); return; }
    setImgError(null);
    setImgPending(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: imgDescription, workspaceId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) { setImgError(data.error ?? "Generation failed."); return; }
      setImgPreview(data.url!);
      setHeaderImageUrl(data.url!);
    } catch {
      setImgError("Generation failed — check your connection.");
    } finally {
      setImgPending(false);
    }
  }

  function generateWithAi() {
    if (!language) { setAiError("Pick a language first."); return; }
    setAiError(null);
    startAiTransition(async () => {
      const result = await generateTemplateWithAi(aiDescription, language);
      if (result.error) { setAiError(result.error); return; }
      if (result.draft) {
        setHeaderType(result.draft.headerType);
        setHeaderText(result.draft.headerText ?? "");
        setBodyText(result.draft.bodyText);
        setFooterText(result.draft.footerText ?? "");
        setQuickReplies(result.draft.quickReplies.join(", "));
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">
        + New template
      </button>
    );
  }

  const bodyRemaining = BODY_MAX - bodyText.length;

  return (
    <div className="sk-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[13px] font-semibold">New template</div>
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-faint hover:text-foreground">
          ✕ Cancel
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Form ── */}
        <form action={formAction} className="flex flex-1 flex-col gap-3">
          <p className="text-[12.5px] text-muted">
            {canSubmitToMeta
              ? "Submits directly to Meta for review — status updates automatically via webhook."
              : "No WhatsApp Business Account connected yet. Saves as a draft; connect one in Settings → Channels to submit."}
          </p>

          {/* AI draft */}
          <div className="rounded-md border border-border p-3">
            <label className="sk-label">✦ Describe it — AI will draft the message</label>
            <div className="flex gap-2">
              <input
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); generateWithAi(); } }}
                className="sk-input flex-1 text-sm"
                placeholder="Re-engage customers who haven't ordered in 30 days with a discount"
              />
              <button type="button" onClick={generateWithAi} disabled={aiPending} className="sk-btn sk-btn-ghost text-[12.5px] disabled:opacity-60">
                {aiPending ? "Drafting…" : "Generate"}
              </button>
            </div>
            {aiError && <p className="mt-1 text-[12px] text-danger">{aiError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sk-label">Internal name</label>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sk-input"
                placeholder="Diwali sale — Hindi"
                required
              />
            </div>
            <div>
              <label className="sk-label">Language</label>
              <select name="language" className="sk-input" required value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="" disabled>Select…</option>
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sk-label">Meta template name <span className="text-faint font-normal">(auto-generated)</span></label>
              <input
                name="metaTemplateName"
                className="sk-input font-mono text-sm"
                placeholder="diwali_sale_hindi"
                value={metaName}
                onChange={(e) => { setMetaName(e.target.value); setMetaNameEdited(true); }}
                required
              />
            </div>
            <div>
              <label className="sk-label">Category</label>
              <select name="category" className="sk-input" defaultValue="MARKETING">
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
          </div>

          <div>
            <label className="sk-label">Message group <span className="text-faint font-normal">(optional — link translations of the same message)</span></label>
            <input name="templateGroup" className="sk-input font-mono text-sm" placeholder="diwali_sale" />
            <p className="mt-1 text-[11.5px] text-faint">
              Same group on Hindi + Tamil versions → one campaign sends each contact their language automatically.
            </p>
          </div>

          {/* Header */}
          <div>
            <label className="sk-label">Header</label>
            <div className="flex gap-2">
              <select name="headerType" className="sk-input w-36" value={headerType} onChange={(e) => { setHeaderType(e.target.value); setHeaderImageUrl(""); setImgPreview(null); }}>
                <option value="none">None</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
              {headerType === "text" && (
                <input name="headerText" value={headerText} onChange={(e) => setHeaderText(e.target.value)} className="sk-input flex-1" placeholder="Header text" />
              )}
            </div>
            {headerType === "image" && (
              <div className="mt-2 rounded-md border border-border p-3 flex flex-col gap-2">
                <label className="sk-label mb-0">✦ Generate with AI</label>
                <div className="flex gap-2">
                  <input
                    value={imgDescription}
                    onChange={(e) => setImgDescription(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); generateImage(); } }}
                    className="sk-input flex-1 text-sm"
                    placeholder="Festive Diwali, warm gold tones, silk textiles"
                  />
                  <button type="button" onClick={generateImage} disabled={imgPending} className="sk-btn sk-btn-ghost text-[12.5px] disabled:opacity-60 whitespace-nowrap">
                    {imgPending ? "Generating…" : imgPreview ? "Regenerate" : "Generate"}
                  </button>
                </div>
                {imgError && <p className="text-[12px] text-danger">{imgError}</p>}
                {imgPending && (
                  <div className="flex items-center gap-2 text-[12px] text-muted">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                      <div className="h-full w-1/3 animate-[sk-skeleton-pulse_1.5s_ease-in-out_infinite] rounded-full bg-accent-dim" />
                    </div>
                    AI is painting your image…
                  </div>
                )}
                {imgPreview && (
                  <div className="flex flex-col gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgPreview} alt="AI-generated header" className="w-full rounded-md border border-border object-cover" style={{ maxHeight: 160 }} />
                    <p className="text-[11px] text-accent">✓ Image ready</p>
                  </div>
                )}
                {!imgPreview && (
                  <div className="mt-1 text-[11.5px] text-faint">
                    Or paste an existing URL:
                    <input
                      value={headerImageUrl}
                      onChange={(e) => { setHeaderImageUrl(e.target.value); setImgPreview(e.target.value || null); }}
                      className="sk-input mt-1 text-sm"
                      placeholder="https://…"
                    />
                  </div>
                )}
                <input type="hidden" name="headerImageUrl" value={headerImageUrl} />
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="sk-label mb-0">Body — use {"{{1}}"} for personalisation</label>
              <span className="text-[11px]" style={{ color: bodyRemaining < 100 ? "var(--danger)" : "var(--faint)" }}>
                {bodyRemaining} left
              </span>
            </div>
            <textarea
              name="bodyText"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value.slice(0, BODY_MAX))}
              className="sk-input"
              rows={4}
              placeholder={"Hi {{1}}, our Diwali sale is live — 20% off everything…"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sk-label">Footer (optional)</label>
              <input name="footerText" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="sk-input" placeholder="Reply STOP to unsubscribe" />
            </div>
            <div>
              <label className="sk-label">Quick-reply buttons (comma-separated, max 3)</label>
              <input name="quickReplies" value={quickReplies} onChange={(e) => setQuickReplies(e.target.value)} className="sk-input" placeholder="Yes, Tell me more, No thanks" />
            </div>
          </div>

          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCarousel((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${isCarousel ? "bg-accent" : "bg-border"}`}
              >
                <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ left: isCarousel ? "18px" : "2px" }} />
              </button>
              <input type="hidden" name="isCarousel" value={isCarousel ? "on" : ""} />
              <span className="text-[13px]">Make this a carousel — 2–10 scrollable cards</span>
            </div>
            {isCarousel && (
              <div className="mt-2">
                <label className="sk-label">One card per line: media handle | body text | button1, button2</label>
                <textarea name="carouselCards" className="sk-input font-mono text-[12px]" rows={4}
                  placeholder={"4::abc123handle | The Diwali Kurta Set — 1,899 | Buy now, More colors\n4::def456handle | The Festive Saree — 2,499 | Buy now"} />
                <p className="mt-1 text-[11.5px] text-faint">Media handles come from Meta&apos;s Resumable Upload API.</p>
              </div>
            )}
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          {state?.warning && <p className="text-sm text-warn">{state.warning}</p>}

          <div className="mt-1 flex gap-3">
            <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
              {pending ? "Submitting…" : canSubmitToMeta ? "Submit to Meta" : "Save draft"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
          </div>
        </form>

        {/* ── Phone preview ── */}
        <WhatsAppPreview
          headerType={headerType}
          headerText={headerText}
          bodyText={bodyText}
          footerText={footerText}
          quickReplies={quickReplies}
        />
      </div>
    </div>
  );
}
