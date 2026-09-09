"use client";

import { useActionState, useEffect, useState } from "react";
import { createCampaign, getAudienceCount } from "./actions";

interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
  body_preview?: string | null;
}

interface WhatsAppNumber {
  id: string;
  label: string;
}

interface Segment {
  id: string;
  name: string;
}

export function NewCampaignForm({
  templates,
  numbers,
  segments,
  availableTags,
}: {
  templates: Template[];
  numbers: WhatsAppNumber[];
  segments: Segment[];
  availableTags: string[];
}) {
  const [state, formAction, pending] = useActionState(createCampaign, null);
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [segmentTag, setSegmentTag] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  useEffect(() => {
    if (!selectedTemplateId) { setAudienceCount(null); return; }
    setCountLoading(true);
    const timeout = setTimeout(async () => {
      const result = await getAudienceCount(selectedTemplateId, segmentTag, selectedSegmentId);
      setAudienceCount(result.count);
      setCountLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [selectedTemplateId, segmentTag, selectedSegmentId]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="sk-btn sk-btn-primary"
        disabled={templates.length === 0}
        title={templates.length === 0 ? "You need at least one approved template first" : undefined}
      >
        + New campaign
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[13px] font-semibold">New campaign</div>
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-faint hover:text-foreground">
          ✕ Cancel
        </button>
      </div>

      <div>
        <label className="sk-label">Campaign name</label>
        <input
          name="name"
          className="sk-input"
          placeholder="Diwali sale — all customers"
          required
        />
      </div>

      <div>
        <label className="sk-label">Template</label>
        <select
          name="templateId"
          className="sk-input"
          required
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          <option value="" disabled>
            Select an approved template…
          </option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.language})
            </option>
          ))}
        </select>
        {/* Template body preview */}
        {selectedTemplate?.body_preview && (
          <div
            className="mt-2 rounded-md border border-border bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] text-muted"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {selectedTemplate.body_preview}
          </div>
        )}
        {templates.length === 0 && (
          <p className="mt-1 text-[12px] text-danger">No approved templates yet — Meta must approve a template before it can be used.</p>
        )}
      </div>

      <div>
        <label className="sk-label">Filter by tag (optional — blank sends to everyone in the template&apos;s language)</label>
        <input
          name="segmentTag"
          value={segmentTag}
          onChange={(e) => setSegmentTag(e.target.value)}
          className="sk-input"
          placeholder="e.g. vip"
        />
        {availableTags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {availableTags.slice(0, 12).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSegmentTag((prev) => (prev === tag ? "" : tag))}
                className="sk-pill cursor-pointer text-[11px] hover:border-accent hover:text-accent"
                style={segmentTag === tag ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Audience size preview */}
        {selectedTemplateId && (
          <div className="mt-2 flex items-center gap-1.5 text-[12px]">
            {countLoading ? (
              <span className="text-faint">Counting…</span>
            ) : audienceCount !== null ? (
              <>
                <span
                  className="font-mono font-semibold tabular-nums"
                  style={{ color: audienceCount === 0 ? "var(--danger)" : "var(--accent)" }}
                >
                  {audienceCount.toLocaleString()}
                </span>
                <span className="text-faint">
                  contact{audienceCount === 1 ? "" : "s"} will receive this
                  {audienceCount === 0 ? " — check the tag or template language" : ""}
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {segments.length > 0 && (
        <div>
          <label className="sk-label">Or a saved segment (optional)</label>
          <select
            name="segmentId"
            className="sk-input"
            value={selectedSegmentId}
            onChange={(e) => setSelectedSegmentId(e.target.value)}
          >
            <option value="">None</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11.5px] text-faint">
            Combined with the tag above if both are set. Build multi-condition segments under{" "}
            <a href="/segments" className="text-accent hover:text-accent-hover">
              Segments
            </a>
            .
          </p>
        </div>
      )}

      {numbers.length > 0 && (
        <div>
          <label className="sk-label">Send from (optional — defaults to your primary number)</label>
          <select name="whatsappNumberId" className="sk-input" defaultValue="">
            <option value="">Primary number</option>
            {numbers.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Creating…" : "Create draft"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
