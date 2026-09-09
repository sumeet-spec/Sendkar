"use client";

import { useState, useTransition } from "react";
import { saveVariableMapping } from "../actions";

const CONTACT_FIELDS: Record<string, string> = {
  name: "Contact name",
  phone: "Phone number",
  email: "Email address",
};

export function VariableMappingForm({
  campaignId,
  bodyText,
  currentMapping,
  disabled,
}: {
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

  return (
    <div className="sk-card mb-6 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold">Personalise message variables</div>
          <div className="mt-0.5 text-[12px] text-faint">
            Map each template placeholder to a contact field so every recipient gets their own details.
          </div>
        </div>
        {saved && <span className="text-[12.5px] text-accent">Saved ✓</span>}
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
            <select
              className="sk-input flex-1 text-[13px]"
              disabled={disabled}
              value={mapping[idx] ?? ""}
              onChange={(e) => {
                setSaved(false);
                setMapping((prev) => ({ ...prev, [idx]: e.target.value }));
              }}
            >
              <option value="">— leave as-is (fills with contact name) —</option>
              {Object.entries(CONTACT_FIELDS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
                const result = await saveVariableMapping(campaignId, mapping);
                if (result.error) setError(result.error);
                else setSaved(true);
              })
            }
            className="sk-btn sk-btn-primary disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save mapping"}
          </button>
          {error && <span className="text-[12.5px] text-danger">{error}</span>}
        </div>
      )}

      {disabled && (
        <p className="mt-2 text-[12px] text-faint">
          Variable mapping is locked once a campaign has started. Duplicate the campaign to change it.
        </p>
      )}
    </div>
  );
}
