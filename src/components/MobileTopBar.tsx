"use client";

import { Logo } from "./Logo";

// Only rendered below md — the desktop sidebar is always visible there, so
// there's nothing to toggle. Dispatches the same event Sidebar listens for.
export function MobileTopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 md:hidden">
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("sk:toggle-sidebar"))}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-accent-glow hover:text-foreground"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
      </button>
      <Logo size="sm" />
      <span className="text-[14px] font-semibold tracking-tight">Sendkar</span>
    </div>
  );
}
