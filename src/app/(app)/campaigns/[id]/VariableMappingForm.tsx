"use client";

import { useState, useTransition } from "react";
import { saveVariableMapping } from "../actions";
import type { CampaignsMoreUi } from "@/lib/i18n/campaignsMoreCopy";


export function VariableMappingForm({
  campaignId,
  bodyText,
  currentMapping,
  disabled,
  t,
}: {
  t: CampaignsMoreUi["mapping"];
  campaignId: string;
  bodyText: string | null | undefined;
  currentMapping: Record<string, string>;
  disabled?: boolean;
}) {
  const placeholders = [...new Set(bodyText?.match(/\{\{(\d+)\}\}/g) ?? [])].map((p) =>
    p.replace(/\{\{|\}\}/g, ""),
  );

  const [mapping, setMapping] = useState<Record<string, string>>(currentMapping);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (placeholders.length === 0) return null;
  const CONTACT_FIELDS: Record<string, string> = { name: t.contactName, phone: t.phone, email: t.email };

  return (
    <div className="sk-card mb-6 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold">{t.title}</div>
          <div className="mt-0.5 text-[12px] text-faint">
            {t.hint}
          </div>
        </div>
        {saved && <span className="text-[12.5px] text-accent">{t.saved}</span>}
      </div>

      <div className="flex flex-col gap-2.5">
        {placeholders.map((idx) => (
          <div key={idx} className="flex items-center gap-3">
            <code
              className="flex-shrink-0 rounded px-2 py-1 text-[12px] font-semibold"
              style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
            >
              {`{{${idx}}}`}
            </code>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 7h10M8.5 4l3.5 3-3.5 3" />
            </svg>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <select
                className="sk-input text-[13px]"
                disabled={disabled}
                value={mapping[idx]?.startsWith("text:") ? "text" : (mapping[idx] ?? "")}
                onChange={(e) => {
                  setSaved(false);
                  setMapping((prev) => ({ ...prev, [idx]: e.target.value === "text" ? "text:" : e.target.value }));
                }}
              >
                <option value="">{t.leave}</option>
                {Object.entries(CONTACT_FIELDS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
                <option value="text">{t.same}</option>
              </select>
              {mapping[idx]?.startsWith("text:") && (
                <input
                  className="sk-input text-[13px]"
                  disabled={disabled}
                  maxLength={200}
                  placeholder={t.samePh}
                  value={mapping[idx].slice(5)}
                  onChange={(e) => {
                    setSaved(false);
                    setMapping((prev) => ({ ...prev, [idx]: `text:${e.target.value}` }));
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {!disabled && (
        <div className="mt-3 flex items-center gap-3">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                setSaved(false);
                const emptyFixed = Object.entries(mapping).find(([, v]) => v === "text:" || v.slice(5).trim() === "" && v.startsWith("text:"));
                if (emptyFixed) {
                  setError(t.needText.replace("{n}", emptyFixed[0]));
                  return;
                }
                const result = await saveVariableMapping(campaignId, mapping);
                if (result.error) setError(result.error);
                else setSaved(true);
              })
            }
            className="sk-btn sk-btn-primary disabled:opacity-60"
          >
            {pending ? t.saving : t.save}
          </button>
          {error && <span className="text-[12.5px] text-danger">{error}</span>}
        </div>
      )}

      {disabled && (
        <p className="mt-2 text-[12px] text-faint">
          {t.locked}
        </p>
      )}
    </div>
  );
}
