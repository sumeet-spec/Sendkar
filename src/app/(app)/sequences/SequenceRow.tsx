"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleSequence, deleteSequence } from "./actions";

const TRIGGER_LABEL: Record<string, string> = {
  keyword: "Keyword",
  cart_abandoned: "Abandoned cart",
  order_placed: "Order placed",
};

interface Sequence {
  id: string;
  name: string;
  trigger_type: string;
  trigger_keyword: string | null;
  is_active: boolean;
  step_count: number;
}

export function SequenceRow({ sequence }: { sequence: Sequence }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`sk-card flex items-center justify-between p-4 ${pending ? "opacity-60" : ""}`}>
      <Link href={`/sequences/${sequence.id}`} className="flex-1 min-w-0 pr-4">
        <div className="font-medium truncate">{sequence.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">
          {TRIGGER_LABEL[sequence.trigger_type] ?? sequence.trigger_type}
          {sequence.trigger_keyword && (
            <> · <span className="font-mono text-accent">{sequence.trigger_keyword}</span></>
          )}
          {" "}· {sequence.step_count} step{sequence.step_count === 1 ? "" : "s"}
        </div>
      </Link>
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => { await toggleSequence(sequence.id, !sequence.is_active); })}
          className={`relative h-5 w-9 rounded-full transition-colors disabled:pointer-events-none ${
            sequence.is_active ? "bg-accent" : "bg-border"
          }`}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
            style={{ left: sequence.is_active ? "18px" : "2px" }}
          />
        </button>
        <span className={`text-[11.5px] ${sequence.is_active ? "text-accent" : "text-faint"}`}>
          {sequence.is_active ? "Active" : "Off"}
        </span>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${sequence.name}"?`)) {
              startTransition(async () => { await deleteSequence(sequence.id); });
            }
          }}
          className="text-xs text-faint hover:text-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
