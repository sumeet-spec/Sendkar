"use client";

import { useState, useTransition } from "react";
import { markReceivablePaid, remindNow, resumeReminders, stopReminders } from "./actions";
import type { RemindersUi } from "@/lib/i18n/remindersCopy";

export function RowActions({ t, id, status }: { t: RemindersUi; id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);

  function run(fn: () => Promise<{ error?: string; sent?: boolean }>, okText?: string) {
    setNote(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setNote({ text: result.error, error: true });
      else if (okText) setNote({ text: okText, error: false });
    });
  }

  const link = "text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        {status === "open" && (
          <>
            <button type="button" disabled={pending} className={link} onClick={() => run(() => remindNow(id), t.reminderSent)}>{t.remindNow}</button>
            <button type="button" disabled={pending} className={link} onClick={() => run(() => markReceivablePaid(id))}>{t.markPaid}</button>
            <button type="button" disabled={pending} className="text-[12.5px] text-faint hover:text-foreground disabled:opacity-50" onClick={() => run(() => stopReminders(id))}>{t.stop}</button>
          </>
        )}
        {(status === "stopped" || status === "failed") && (
          <button type="button" disabled={pending} className={link} onClick={() => run(() => resumeReminders(id))}>{t.resume}</button>
        )}
      </div>
      {note && <span className={`max-w-[220px] text-right text-[11.5px] ${note.error ? "text-danger" : "text-accent"}`}>{note.text}</span>}
    </div>
  );
}
