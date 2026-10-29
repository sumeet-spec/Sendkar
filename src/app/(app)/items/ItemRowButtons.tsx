"use client";

import { useTransition } from "react";
import { removeItem, toggleItem } from "./actions";

export function ItemRowButtons({ id, active, hide, show, remove, confirmText }: { id: string; active: boolean; hide: string; show: string; remove: string; confirmText: string }) {
  const [pending, start] = useTransition();
  return (
    <span className="flex items-center gap-3">
      <button type="button" disabled={pending} onClick={() => start(() => toggleItem(id, !active))} className="text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-50">{active ? hide : show}</button>
      <button type="button" disabled={pending} onClick={() => { if (confirm(confirmText)) start(() => removeItem(id)); }} className="text-[12.5px] text-faint hover:text-danger disabled:opacity-50">{remove}</button>
    </span>
  );
}
