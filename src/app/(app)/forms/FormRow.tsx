"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteWaFlow } from "./actions";

const STATUS_STYLE: Record<string, string> = {
  draft: "text-faint",
  published: "border-accent text-accent",
  error: "border-danger text-danger",
};

interface Form {
  id: string;
  name: string;
  status: string;
  error_message: string | null;
  screen_count: number;
}

export function FormRow({ form }: { form: Form }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`sk-card flex items-center justify-between p-4 ${pending ? "opacity-60" : ""}`}>
      <Link href={`/forms/${form.id}`} className="flex-1 min-w-0 pr-4">
        <div className="font-medium truncate">{form.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">
          {form.screen_count} screen{form.screen_count === 1 ? "" : "s"}
          {form.status === "error" && form.error_message
            ? <span className="text-danger"> · {form.error_message}</span>
            : null}
        </div>
      </Link>
      <div className="flex flex-shrink-0 items-center gap-3">
        <span className={`sk-pill ${STATUS_STYLE[form.status] ?? ""}`}>{form.status}</span>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "${form.name}"?`)) {
              startTransition(async () => { await deleteWaFlow(form.id); });
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
