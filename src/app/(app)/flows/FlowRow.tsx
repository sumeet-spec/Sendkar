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
    <div className={`sk-card flex items-center justify-between p-4 ${pending ? "opacity-60" : ""}`}>
      <Link href={`/flows/${flow.id}`} className="flex-1 min-w-0 pr-4">
        <div className="font-medium truncate">{flow.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">
          Triggers on <span className="font-mono text-accent">{flow.trigger_keyword}</span>
          <span className="ml-1 sk-pill text-faint text-[10.5px]">{flow.match_type}</span>
          {" "}· {flow.step_count} step{flow.step_count === 1 ? "" : "s"}
        </div>
      </Link>
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => { await toggleFlow(flow.id, !flow.is_active); })}
          className={`relative h-5 w-9 rounded-full transition-colors disabled:pointer-events-none ${
            flow.is_active ? "bg-accent" : "bg-border"
          }`}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
            style={{ left: flow.is_active ? "18px" : "2px" }}
          />
        </button>
        <span className={`text-[11.5px] ${flow.is_active ? "text-accent" : "text-faint"}`}>
          {flow.is_active ? "Active" : "Off"}
        </span>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${flow.name}"?`)) {
              startTransition(async () => { await deleteFlow(flow.id); });
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
