"use client";

import { useTransition } from "react";
import { markBillPaid } from "./actions";

export function MarkPaidButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => { await markBillPaid(id); })} className="text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-50">
      {label}
    </button>
  );
}
