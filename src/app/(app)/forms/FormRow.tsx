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
    <div className="sk-card flex items-center justify-between p-4">
      <Link href={`/forms/${form.id}`} className="flex-1">
        <div className="font-medium">{form.name}</div>
        <div className="mt-0.5 text-[12.5px] text-faint">
          {form.screen_count} screen{form.screen_count === 1 ? "" : "s"}
          {form.status === "error" && form.error_message ? ` · ${form.error_message}` : ""}
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <span className={`sk-pill ${STATUS_STYLE[form.status] ?? ""}`}>{form.status}</span>
        <button disabled={pending} onClick={() => startTransition(() => deleteWaFlow(form.id))} className="text-xs text-faint hover:text-danger">
          Delete
        </button>
      </div>
    </div>
  );
}
