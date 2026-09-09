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
    <form action={formAction} className="sk-card mt-4 flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="font-semibold">New campaign</div>
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-faint hover:text-foreground">
          ✕ Cancel
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="sk-label">Campaign name</label>
        <input name="name" className="sk-input" placeholder="Diwali sale — all customers" required />
      </div>

      {/* Template */}
      <div>
        <label className="sk-label">Template</label>
        <select
          name="templateId"
          className="sk-input"
          required
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          <option value="" disabled>Select an approved template…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
          ))}
        </select>
        {selectedTemplate?.body_preview && (
          <div className="mt-2 rounded-md border border-border bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] text-muted" style={{ whiteSpace: "pre-wrap" }}>
            {selectedTemplate.body_preview}
          </div>
        )}
        {templates.length === 0 && (
          <p className="mt-1 text-[12px] text-danger">No approved templates — Meta must approve one before it can be used in a campaign.</p>
        )}
      </div>

      {/* Audience */}
      <div className="rounded-lg border border-border p-3.5">
        <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">Audience</div>

        <div className="flex flex-col gap-3">
          {/* Tag filter */}
          <div>
            <label className="sk-label text-[10.5px]">Filter by tag <span className="font-normal text-faint">(optional — blank sends to everyone in the template&apos;s language)</span></label>
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
          </div>

          {/* Saved segment */}
          {segments.length > 0 && (
            <div>
              <label className="sk-label text-[10.5px]">Or a saved segment <span className="font-normal text-faint">(combined with tag above if both set)</span></label>
              <select
                name="segmentId"
                className="sk-input"
                value={selectedSegmentId}
                onChange={(e) => setSelectedSegmentId(e.target.value)}
              >
                <option value="">None</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Audience size preview */}
          {selectedTemplateId && (
            <div className="flex items-center gap-1.5 text-[12px]">
              {countLoading ? (
                <span className="text-faint">Counting…</span>
              ) : audienceCount !== null ? (
                <>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: audienceCount === 0 ? "var(--danger)" : "var(--accent)" }}>
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
      </div>

      {/* Send-from number */}
      {numbers.length > 0 && (
        <div>
          <label className="sk-label">Send from <span className="font-normal text-faint">(optional — defaults to your primary number)</span></label>
          <select name="whatsappNumberId" className="sk-input" defaultValue="">
            <option value="">Primary number</option>
            {numbers.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule */}
      <div>
        <label className="sk-label">Schedule <span className="font-normal text-faint">(optional — leave blank to send manually from the campaign page)</span></label>
        <input
          name="scheduledAt"
          type="datetime-local"
          className="sk-input text-[13px]"
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex gap-3">
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
