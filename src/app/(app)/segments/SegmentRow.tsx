"use client";

import { useTransition } from "react";
import { deleteSegment } from "./actions";
import { describeSegmentConditions, type SegmentCondition } from "@/lib/segments";

export function SegmentRow({
  segment,
  contactCount,
}: {
  segment: { id: string; name: string; conditions: SegmentCondition[] };
  contactCount: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card flex items-center justify-between p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium">{segment.name}</div>
          <span className="sk-pill border-accent text-accent">
            {contactCount.toLocaleString()} contact{contactCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-0.5 text-[12.5px] text-faint">{describeSegmentConditions(segment.conditions)}</div>
      </div>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete segment "${segment.name}"? This cannot be undone.`)) {
            startTransition(async () => { await deleteSegment(segment.id); });
          }
        }}
        className="ml-4 text-[12.5px] text-faint hover:text-danger disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
