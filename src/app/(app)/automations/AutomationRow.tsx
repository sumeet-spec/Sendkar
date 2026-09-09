"use client";

import { useTransition } from "react";
import { toggleAutomation, deleteAutomation } from "./actions";

interface Automation {
  id: string; name: string; trigger_keyword: string; match_type: string; reply_body: string; is_active: boolean;
}

export function AutomationRow({ automation }: { automation: Automation }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`sk-card p-4 ${pending ? "opacity-60" : ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">{automation.name}</div>
        <div className="flex items-center gap-3">
          {/* Proper pill toggle */}
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(async () => { await toggleAutomation(automation.id, !automation.is_active); })}
            className={`relative h-5 w-9 rounded-full transition-colors disabled:pointer-events-none ${
              automation.is_active ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
              style={{ left: automation.is_active ? "18px" : "2px" }}
            />
          </button>
          <span className={`text-[11.5px] ${automation.is_active ? "text-accent" : "text-faint"}`}>
            {automation.is_active ? "Active" : "Paused"}
          </span>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete "${automation.name}"?`)) {
                startTransition(async () => { await deleteAutomation(automation.id); });
              }
            }}
            className="text-xs text-faint hover:text-danger"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-[12.5px] text-faint">
        When message {automation.match_type === "exact" ? "is exactly" : "contains"}{" "}
        <span className="font-mono text-accent">&quot;{automation.trigger_keyword}&quot;</span>
      </div>
      <p className="mt-1.5 text-[13px] text-muted">{automation.reply_body}</p>
    </div>
  );
}
