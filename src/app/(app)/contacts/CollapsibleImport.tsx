"use client";

import { useState } from "react";
import { ImportForm } from "./ImportForm";

export function CollapsibleImport() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[13px] text-muted hover:text-foreground"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        Import contacts from CSV
      </button>
      {open && (
        <div className="mt-3">
          <ImportForm />
        </div>
      )}
    </div>
  );
}
