"use client";

import { useTransition } from "react";
import { deleteSegment } from "./actions";
import { describeSegmentConditions, type SegmentCondition } from "@/lib/segments";

export function SegmentRow({ segment }: { segment: { id: string; name: string; conditions: SegmentCondition[] } }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card flex items-center justify-between p-4">
      <div>
        <div className="font-medium">{segment.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">{describeSegmentConditions(segment.conditions)}</div>
      </div>
      <button disabled={pending} onClick={() => startTransition(() => deleteSegment(segment.id))} className="text-xs text-faint hover:text-danger">
        Delete
      </button>
    </div>
  );
}
