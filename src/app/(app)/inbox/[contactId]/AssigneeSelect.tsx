"use client";

import { useTransition } from "react";
import { assignContact } from "../actions";
import type { InboxUi } from "@/lib/i18n/inboxCopy";

interface Member {
  userId: string;
  email: string | null;
}

export function AssigneeSelect({ t, contactId, members, assigneeId }: { t: InboxUi; contactId: string; members: Member[]; assigneeId: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={assigneeId ?? ""}
      disabled={pending}
      onChange={(e) => { const val = e.target.value || null; startTransition(async () => { await assignContact(contactId, val); }); }}
      className="sk-input w-auto text-[12.5px] disabled:opacity-60"
    >
      <option value="">{t.unassignedOpt}</option>
      {members.map((m) => (
        <option key={m.userId} value={m.userId}>{m.email ?? m.userId.slice(0, 8)}</option>
      ))}
    </select>
  );
}
