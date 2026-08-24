"use client";

import { useActionState, useState, useTransition } from "react";
import { createTemplate, generateTemplateWithAi } from "./actions";

const LANGUAGES = [
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "en", label: "English" },
];

export function NewTemplateForm({ canSubmitToMeta }: { canSubmitToMeta: boolean }) {
  const [state, formAction, pending] = useActionState(createTemplate, null);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("");
  const [headerType, setHeaderType] = useState("none");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [quickReplies, setQuickReplies] = useState("");
  const [isCarousel, setIsCarousel] = useState(false);

  const [aiDescription, setAiDescription] = useState("");
  const [aiPending, startAiTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);

  function generateWithAi() {
    if (!language) {
      setAiError("Pick a language first, so the draft is written in it.");
      return;
    }
    setAiError(null);
    startAiTransition(async () => {
      const result = await generateTemplateWithAi(aiDescription, language);
      if (result.error) {
        setAiError(result.error);
        return;
      }
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

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <p className="text-[12.5px] text-muted">
        {canSubmitToMeta
          ? "This submits directly to Meta for review — the same request Business Manager makes, just from here."
          : "No WhatsApp Business Account connected yet, so this saves as a draft only. Connect one in Settings → Channels to submit for real review."}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Internal name</label>
          <input name="name" className="sk-input" placeholder="Launch DM — Hindi" required />
        </div>
        <div>
          <label className="sk-label">Language</label>
          <select name="language" className="sk-input" required value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="" disabled>Select…</option>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-border p-3">
        <label className="sk-label">✳ Describe the message, let AI draft it</label>
        <div className="flex gap-2">
          <input
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            className="sk-input flex-1 text-sm"
            placeholder="Announce we've launched on WhatsApp, ask if they want to hear about new drops"
          />
          <button type="button" onClick={generateWithAi} disabled={aiPending} className="sk-btn sk-btn-ghost text-[12.5px] disabled:opacity-60">
            {aiPending ? "Drafting…" : "Generate"}
          </button>
        </div>
        {aiError && <p className="mt-1 text-[12px] text-danger">{aiError}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Meta template name (lowercase, underscores)</label>
          <input name="metaTemplateName" className="sk-input font-mono text-sm" placeholder="instastarz_launch_hi" required />
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
        <label className="sk-label">Message group (optional — same value on every language&apos;s version of this message)</label>
        <input name="templateGroup" className="sk-input font-mono text-sm" placeholder="launch_announcement" />
        <p className="mt-1 text-[11.5px] text-faint">
          Set the same group on the Hindi, Tamil, Telugu... versions of one message, then a single campaign
          auto-sends each contact their own language instead of you launching one campaign per language.
        </p>
      </div>

      <div>
        <label className="sk-label">Header</label>
        <div className="flex gap-2">
          <select name="headerType" className="sk-input w-40" value={headerType} onChange={(e) => setHeaderType(e.target.value)}>
            <option value="none">None</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
          {headerType === "text" && (
            <input name="headerText" value={headerText} onChange={(e) => setHeaderText(e.target.value)} className="sk-input flex-1" placeholder="Header text" />
          )}
        </div>
      </div>

      <div>
        <label className="sk-label">Body — use {"{{1}}"} for the recipient&apos;s name</label>
        <textarea
          name="bodyText"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          className="sk-input"
          rows={4}
          placeholder={"Hi {{1}}, we've launched on WhatsApp..."}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Footer (optional)</label>
          <input name="footerText" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="sk-input" placeholder="Reply STOP to unsubscribe" />
        </div>
        <div>
          <label className="sk-label">Quick-reply buttons (comma-separated, up to 3)</label>
          <input name="quickReplies" value={quickReplies} onChange={(e) => setQuickReplies(e.target.value)} className="sk-input" placeholder="Yes, No" />
        </div>
      </div>

      <div className="rounded-md border border-border p-3">
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="isCarousel" checked={isCarousel} onChange={(e) => setIsCarousel(e.target.checked)} />
          Make this a carousel — 2-10 scrollable cards instead of one message
        </label>
        {isCarousel && (
          <div className="mt-2">
            <label className="sk-label">One card per line: media handle | card body text | button1, button2 (buttons optional)</label>
            <textarea
              name="carouselCards"
              className="sk-input font-mono text-[12px]"
              rows={4}
              placeholder={"4::abc123handle | The Diwali Kurta Set — ₹1,899 | Buy now, More colors\n4::def456handle | The Festive Saree — ₹2,499 | Buy now"}
            />
            <p className="mt-1 text-[11.5px] text-faint">
              The media handle comes from Meta&apos;s Resumable Upload API — there&apos;s no plain-image-URL shortcut for a
              template&apos;s stored card asset, unlike a one-off send.
            </p>
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
  );
}
