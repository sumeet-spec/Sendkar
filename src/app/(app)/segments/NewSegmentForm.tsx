"use client";

import { useActionState, useState } from "react";
import { createSegment } from "./actions";
import type { SegmentField } from "@/lib/segments";
import type { SegmentsUi } from "@/lib/i18n/segmentsCopy";
import type { CareUi } from "@/lib/i18n/careUi";

const FIELDS: SegmentField[] = ["tag", "auto_tag", "language", "source", "sentiment"];

export function NewSegmentForm({ t, care }: { t: SegmentsUi; care: CareUi }) {
  const [state, formAction, pending] = useActionState(createSegment, null);
  const [rows, setRows] = useState([{ field: "tag" as SegmentField, value: "" }]);

  return (
    <details className="sk-card p-4">
      <summary className="cursor-pointer text-sm font-medium">{t.newSegment}</summary>
      <form action={formAction} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="sk-label">{t.name}</label>
          <input name="name" required className="sk-input" placeholder={t.namePh} />
        </div>

        <div>
          <label className="sk-label">{t.conditions}</label>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <select
                  name="field"
                  value={row.field}
                  onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, field: e.target.value as SegmentField } : x)))}
                  className="sk-input w-40"
                >
                  {FIELDS.map((f) => <option key={f} value={f}>{t.field[f]}</option>)}
                </select>
                {row.field === "auto_tag" ? (
                  <select
                    name="value"
                    value={row.value}
                    onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    className="sk-input flex-1"
                  >
                    <option value="">{t.pickOne}</option>
                    {(["regular", "lapsed", "big_spender", "owes", "over_limit", "new"] as const).map((k) => <option key={k} value={k}>{care.tag[k]}</option>)}
                  </select>
                ) : (
                  <input
                    name="value"
                    value={row.value}
                    onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                    className="sk-input flex-1"
                    placeholder={t.valuePh}
                  />
                )}
                {rows.length > 1 && (
                  <button type="button" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} className="text-xs text-faint hover:text-danger">
                    {t.remove}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { field: "tag", value: "" }])}
            className="mt-2 text-[12.5px] text-accent hover:text-accent-hover"
          >
            {t.addCondition}
          </button>
        </div>

        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">
          {pending ? t.creating : t.create}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </details>
  );
}
