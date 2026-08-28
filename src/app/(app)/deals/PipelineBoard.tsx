"use client";

import { useState, useTransition } from "react";
import { moveDealStage, deleteDeal } from "./actions";
import { DEAL_STAGES, type DealStage } from "./constants";

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  contactName: string | null;
}

const STAGE_LABELS: Record<DealStage, string> = {
  new: "New",
  contacted: "Contacted",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
};

export function PipelineBoard({ deals }: { deals: Deal[] }) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const [, startTransition] = useTransition();

  function drop(stage: DealStage) {
    if (dragging) startTransition(() => moveDealStage(dragging, stage));
    setDragging(null);
    setDragOverStage(null);
  }

  const totalByStage = DEAL_STAGES.reduce<Record<DealStage, number>>((acc, s) => {
    acc[s] = deals.filter((d) => d.stage === s).reduce((sum, d) => sum + d.value, 0);
    return acc;
  }, {} as Record<DealStage, number>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {DEAL_STAGES.map((stage) => (
        <div
          key={stage}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStage(stage);
          }}
          onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
          onDrop={() => drop(stage)}
          className={`flex w-64 shrink-0 flex-col rounded-lg border p-2.5 transition-colors ${
            dragOverStage === stage ? "border-accent bg-accent-glow" : "border-border bg-surface"
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between px-1">
            <span className="text-[12.5px] font-medium text-muted">{STAGE_LABELS[stage]}</span>
            <span className="text-[11px] text-faint">
              {deals.filter((d) => d.stage === stage).length} · ₹{totalByStage[stage].toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {deals
              .filter((d) => d.stage === stage)
              .map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => setDragging(deal.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`sk-card cursor-grab p-3 text-[13px] active:cursor-grabbing ${
                    dragging === deal.id ? "opacity-40" : ""
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="font-medium">{deal.title}</span>
                    <button
                      type="button"
                      onClick={() => startTransition(() => deleteDeal(deal.id))}
                      className="shrink-0 text-[11px] text-faint hover:text-danger"
                    >
                      ✕
                    </button>
                  </div>
                  {deal.contactName && <div className="text-[11.5px] text-faint">{deal.contactName}</div>}
                  {deal.value > 0 && <div className="mt-1 text-[12px] text-accent">₹{deal.value.toLocaleString("en-IN")}</div>}
                </div>
              ))}
            {deals.filter((d) => d.stage === stage).length === 0 && (
              <div className="rounded-md border border-dashed border-border p-4 text-center text-[11.5px] text-faint">Drop here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
