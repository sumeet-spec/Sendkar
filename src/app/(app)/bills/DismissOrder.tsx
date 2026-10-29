"use client";

import { useTransition } from "react";
import { dismissOrder } from "./actions";

export function DismissOrder({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => dismissOrder(id))} className="text-[12.5px] text-faint hover:text-foreground disabled:opacity-50">
      {label}
    </button>
  );
}
