"use client";

import { useActionState, useEffect, useState } from "react";
import type { CampaignCopy } from "@/lib/i18n/campaignCopy";
import { createCampaign, getAudienceCount } from "./actions";

interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
  body_preview?: string | null;
  header_type?: string | null;
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
  cardUrl,
  cardUrls,
  t,
}: {
  t: CampaignCopy["form"];
  templates: Template[];
  numbers: WhatsAppNumber[];
  segments: Segment[];
  availableTags: string[];
  cardUrl?: string;
  cardUrls?: Record<string, string> | null;
}) {
  const [state, formAction, pending] = useActionState(createCampaign, null);
  const [open, setOpen] = useState(Boolean(cardUrl || cardUrls));
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [segmentTag, setSegmentTag] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId) ?? null;

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
        title={templates.length === 0 ? t.needTemplate : undefined}
      >
        + {t.newCampaign}
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card mt-4 flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{t.newCampaign}</div>
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-faint hover:text-foreground">
          ✕ Cancel
        </button>
      </div>

      {cardUrls && (
        <div className="rounded-md border border-border bg-[var(--surface-2)] p-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(cardUrls).map(([code, url]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={code} src={url} alt={`Card in ${code}`} className="h-16 w-16 rounded-md object-cover" />
            ))}
          </div>
          <p className="mt-2 text-[12.5px] text-muted">{t.cardLanguages}</p>
          <input type="hidden" name="imageUrls" value={JSON.stringify(cardUrls)} />
        </div>
      )}
      {cardUrl && !cardUrls && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-[var(--surface-2)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardUrl} alt="Your card" className="h-20 w-20 rounded-md object-cover" />
          <p className="text-[12.5px] text-muted">{t.cardOne}</p>
          <input type="hidden" name="imageUrl" value={cardUrl} />
        </div>
      )}

      {/* Name */}
      <div>
        <label className="sk-label">{t.name}</label>
        <input name="name" className="sk-input" placeholder={t.namePlaceholder} required />
      </div>

      {/* Template */}
      <div>
        <label className="sk-label">{t.template}</label>
        <select
          name="templateId"
          className="sk-input"
          required
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          <option value="" disabled>{t.selectTemplate}</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.language}){tpl.header_type === "image" ? ` · ${t.withPicture}` : ""}</option>
          ))}
        </select>
        {(cardUrl || cardUrls) && selectedTemplate && selectedTemplate.header_type !== "image" && (
          <p className="mt-2 text-[12.5px] text-danger">{t.noPicture}</p>
        )}
        {selectedTemplate?.body_preview && (
          <div className="mt-2 rounded-md border border-border bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] text-muted" style={{ whiteSpace: "pre-wrap" }}>
            {selectedTemplate.body_preview}
          </div>
        )}
        {templates.length === 0 && (
          <p className="mt-1 text-[12px] text-danger">{t.noApproved}</p>
        )}
      </div>

      {/* Audience */}
      <div className="rounded-lg border border-border p-3.5">
        <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.audience}</div>

        <div className="flex flex-col gap-3">
          {/* Tag filter */}
          <div>
            <label className="sk-label text-[10.5px]">{t.tagLabel} <span className="font-normal text-faint">{t.tagHelp}</span></label>
            <input
              name="segmentTag"
              value={segmentTag}
              onChange={(e) => setSegmentTag(e.target.value)}
              className="sk-input"
              placeholder={t.tagPlaceholder}
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
              <label className="sk-label text-[10.5px]">{t.segmentLabel} <span className="font-normal text-faint">{t.segmentHelp}</span></label>
              <select
                name="segmentId"
                className="sk-input"
                value={selectedSegmentId}
                onChange={(e) => setSelectedSegmentId(e.target.value)}
              >
                <option value="">{t.none}</option>
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
                <span className="text-faint">{t.counting}</span>
              ) : audienceCount !== null ? (
                <>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: audienceCount === 0 ? "var(--danger)" : "var(--accent)" }}>
                    {audienceCount.toLocaleString()}
                  </span>
                  <span className="text-faint">
                    {t.willReceive.replace("{n}", "").trim()}
                    {audienceCount === 0 ? t.checkTag : ""}
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
          <label className="sk-label">{t.sendFrom} <span className="font-normal text-faint">{t.sendFromHelp}</span></label>
          <select name="whatsappNumberId" className="sk-input" defaultValue="">
            <option value="">{t.primaryNumber}</option>
            {numbers.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule */}
      <div>
        <label className="sk-label">{t.schedule} <span className="font-normal text-faint">{t.scheduleHelp}</span></label>
        <input
          name="scheduledAt"
          type="datetime-local"
          className="sk-input text-[13px]"
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? t.creating : t.createDraft}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
