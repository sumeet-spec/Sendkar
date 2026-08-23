"use client";

import { useTransition } from "react";
import { assignContact } from "../actions";

interface Member {
  userId: string;
  email: string | null;
}

export function AssigneeSelect({ contactId, members, assigneeId }: { contactId: string; members: Member[]; assigneeId: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={assigneeId ?? ""}
      disabled={pending}
      onChange={(e) => startTransition(() => assignContact(contactId, e.target.value || null))}
      className="sk-input w-auto text-[12.5px] disabled:opacity-60"
    >
      <option value="">Unassigned</option>
      {members.map((m) => (
        <option key={m.userId} value={m.userId}>{m.email ?? m.userId.slice(0, 8)}</option>
      ))}
    </select>
  );
}
