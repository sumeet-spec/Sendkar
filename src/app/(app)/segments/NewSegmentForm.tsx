"use client";

import { useActionState, useState } from "react";
import { createSegment } from "./actions";
import { SEGMENT_FIELD_LABELS, type SegmentField } from "@/lib/segments";

const FIELDS = Object.keys(SEGMENT_FIELD_LABELS) as SegmentField[];

export function NewSegmentForm() {
  const [state, formAction, pending] = useActionState(createSegment, null);
  const [rows, setRows] = useState([{ field: "tag" as SegmentField, value: "" }]);

  return (
    <details className="sk-card p-4">
      <summary className="cursor-pointer text-sm font-medium">New segment</summary>
      <form action={formAction} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="sk-label">Name</label>
          <input name="name" required className="sk-input" placeholder="VIP Hindi buyers" />
        </div>

        <div>
          <label className="sk-label">Conditions (all must match)</label>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <select
                  name="field"
                  value={row.field}
                  onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, field: e.target.value as SegmentField } : x)))}
                  className="sk-input w-40"
                >
                  {FIELDS.map((f) => <option key={f} value={f}>{SEGMENT_FIELD_LABELS[f]}</option>)}
                </select>
                <input
                  name="value"
                  value={row.value}
                  onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                  className="sk-input flex-1"
                  placeholder="value"
                />
                {rows.length > 1 && (
                  <button type="button" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} className="text-xs text-faint hover:text-danger">
                    Remove
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
            + Add condition
          </button>
        </div>

        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">
          {pending ? "Creating…" : "Create"}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </details>
  );
}
