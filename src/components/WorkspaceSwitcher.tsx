"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchWorkspace } from "@/app/(app)/workspace-actions";

interface UserWorkspace {
  id: string;
  name: string;
  role: string;
}

/**
 * Agency mode's UI: switch which client account you're viewing, or add a
 * new one, without logging out — one login managing several workspaces
 * instead of every client needing a separate account.
 */
export function WorkspaceSwitcher({ workspaces, currentId }: { workspaces: UserWorkspace[]; currentId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const current = workspaces.find((w) => w.id === currentId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left hover:bg-surface-2 disabled:opacity-60"
      >
        <div className="truncate text-[12.5px] font-medium text-muted">{current?.name ?? "Workspace"}</div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 text-faint">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-md border border-border bg-surface-2 py-1 shadow-lg">
          {workspaces.length > 1 && (
            <div className="px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-faint">Your workspaces</div>
          )}
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setOpen(false);
                if (w.id !== currentId) startTransition(() => switchWorkspace(w.id));
              }}
              className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[12.5px] hover:bg-surface ${
                w.id === currentId ? "text-accent" : "text-muted"
              }`}
            >
              <span className="truncate">{w.name}</span>
              {w.id === currentId && <span className="text-[10px]">●</span>}
            </button>
          ))}
          <div className="mt-1 border-t border-border pt-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/agency");
              }}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[12.5px] text-accent hover:bg-surface"
            >
              + Add client workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
