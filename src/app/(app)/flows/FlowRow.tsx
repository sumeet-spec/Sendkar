"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleFlow, deleteFlow } from "./actions";

interface Flow {
  id: string;
  name: string;
  trigger_keyword: string;
  match_type: string;
  is_active: boolean;
  step_count: number;
}

export function FlowRow({ flow }: { flow: Flow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card flex items-center justify-between p-4">
      <Link href={`/flows/${flow.id}`} className="flex-1">
        <div className="font-medium">{flow.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">
          Triggers on <span className="font-mono text-accent">{flow.trigger_keyword}</span> ({flow.match_type}) · {flow.step_count} step{flow.step_count === 1 ? "" : "s"}
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-[12.5px] text-muted">
          <input
            type="checkbox"
            checked={flow.is_active}
            disabled={pending}
            onChange={(e) => startTransition(() => toggleFlow(flow.id, e.target.checked))}
          />
          Active
        </label>
        <button disabled={pending} onClick={() => startTransition(() => deleteFlow(flow.id))} className="text-xs text-faint hover:text-danger">
          Delete
        </button>
      </div>
    </div>
  );
}
