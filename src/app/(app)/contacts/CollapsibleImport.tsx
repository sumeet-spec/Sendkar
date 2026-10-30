"use client";

import { useState } from "react";
import { ImportForm } from "./ImportForm";
import type { ContactsUi } from "@/lib/i18n/contactsCopy";

export function CollapsibleImport({ t }: { t: ContactsUi }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[13px] text-muted hover:text-foreground"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        {t.importToggle}
      </button>
      {open && (
        <div className="mt-3">
          <ImportForm t={t} />
        </div>
      )}
    </div>
  );
}
