"use client";

import { useTransition } from "react";
import { deleteWaFlowScreen } from "../actions";

interface Field { type: string; label: string; required?: boolean; options?: string[] }
interface Screen { id: string; title: string; fields: Field[] }

const TYPE_LABEL: Record<string, string> = {
  text_heading: "Heading", text_body: "Text", text_input: "Short answer", text_area: "Long answer",
  radio_buttons: "Choose one", checkbox: "Choose many",
};

export function ScreenRow({ waFlowId, screen, isLast, locked }: { waFlowId: string; screen: Screen; isLast: boolean; locked: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="sk-pill border-accent text-accent">{screen.id}</span>
        {!locked && (
          <button disabled={pending} onClick={() => startTransition(() => deleteWaFlowScreen(waFlowId, screen.id))} className="text-xs text-faint hover:text-danger">
            Delete
          </button>
        )}
      </div>
      <div className="mb-2 font-medium">{screen.title}</div>
      <div className="flex flex-col gap-1">
        {screen.fields.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-[12.5px] text-muted">
            <span className="sk-pill">{TYPE_LABEL[f.type] ?? f.type}</span>
            <span>{f.label}{f.required && <span className="text-danger"> *</span>}</span>
            {f.options && <span className="text-faint">({f.options.join(", ")})</span>}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-faint">{isLast ? "Ends the form (submit)" : "Continues to the next screen"}</div>
    </div>
  );
}
