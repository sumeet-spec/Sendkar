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
    <div className="sk-card flex items-center justify-between p-4">
      <Link href={`/sequences/${sequence.id}`} className="flex-1">
        <div className="font-medium">{sequence.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">
          {TRIGGER_LABEL[sequence.trigger_type] ?? sequence.trigger_type}
          {sequence.trigger_keyword && <> · <span className="font-mono text-accent">{sequence.trigger_keyword}</span></>}
          {" "}· {sequence.step_count} step{sequence.step_count === 1 ? "" : "s"}
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-[12.5px] text-muted">
          <input
            type="checkbox"
            checked={sequence.is_active}
            disabled={pending}
            onChange={(e) => startTransition(() => toggleSequence(sequence.id, e.target.checked))}
          />
          Active
        </label>
        <button disabled={pending} onClick={() => startTransition(() => deleteSequence(sequence.id))} className="text-xs text-faint hover:text-danger">
          Delete
        </button>
      </div>
    </div>
  );
}
