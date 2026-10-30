"use client";

import { useTransition } from "react";
import { deleteSegment } from "./actions";
import { describeSegmentConditionsIn, type SegmentCondition } from "@/lib/segments";
import type { SegmentsUi } from "@/lib/i18n/segmentsCopy";
import type { CareUi } from "@/lib/i18n/careUi";

export function SegmentRow({
  t,
  care,
  segment,
  contactCount,
}: {
  t: SegmentsUi;
  care: CareUi;
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
            {contactCount === 1 ? t.contactsOne : t.contactsMany.replace("{n}", contactCount.toLocaleString())}
          </span>
        </div>
        <div className="mt-0.5 text-[12.5px] text-faint">{describeSegmentConditionsIn(segment.conditions, t.field, t.everyone, (c) => (c.field === "auto_tag" && c.value in care.tag ? care.tag[c.value as keyof CareUi["tag"]] : c.value))}</div>
      </div>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(t.confirmDelete.replace("{name}", segment.name))) {
            startTransition(async () => { await deleteSegment(segment.id); });
          }
        }}
        className="ml-4 text-[12.5px] text-faint hover:text-danger disabled:opacity-50"
      >
        {t.delete}
      </button>
    </div>
  );
}
