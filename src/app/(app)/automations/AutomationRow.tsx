"use client";

import { useTransition } from "react";
import { toggleAutomation, deleteAutomation } from "./actions";

interface Automation {
  id: string; name: string; trigger_keyword: string; match_type: string; reply_body: string; is_active: boolean;
}

export function AutomationRow({ automation }: { automation: Automation }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">{automation.name}</div>
        <div className="flex items-center gap-2">
          <button
            disabled={pending}
            onClick={() => startTransition(() => toggleAutomation(automation.id, !automation.is_active))}
            className={`sk-pill ${automation.is_active ? "bg-accent text-[#05130a] border-accent" : ""}`}
          >
            {automation.is_active ? "active" : "paused"}
          </button>
          <button disabled={pending} onClick={() => startTransition(() => deleteAutomation(automation.id))} className="text-xs text-faint hover:text-danger">
            Delete
          </button>
        </div>
      </div>
      <div className="text-[12.5px] text-faint">
        When message {automation.match_type === "exact" ? "is exactly" : "contains"} &quot;{automation.trigger_keyword}&quot;
      </div>
      <p className="mt-2 text-[13px] text-muted">{automation.reply_body}</p>
    </div>
  );
}
