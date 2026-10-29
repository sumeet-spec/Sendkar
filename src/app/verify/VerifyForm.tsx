"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { requestCode, submitCode } from "./actions";
import { Logo } from "@/components/Logo";
import type { VerifyCopy } from "@/lib/i18n/verifyCopy";
import type { VerifyError } from "@/lib/phoneVerify";

export function VerifyForm({ t, phone }: { t: VerifyCopy; phone: string }) {
  const [state, formAction, checking] = useActionState(submitCode, null);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [sendError, setSendError] = useState<VerifyError | null>(null);
  const started = useRef(false);

  async function send() {
    setSending(true);
    setNote(null);
    setSendError(null);
    const res = await requestCode();
    setSending(false);
    if (res.ok) setNote(t.sent);
    else setSendError(res.error ?? "sendFailed");
  }

  // One code goes out when the page opens; the person can ask for another after a minute.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const error = state?.error ?? sendError;
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight">Sendkar</span>
        </div>
        <h1 className="mb-1 text-xl font-semibold">{t.title}</h1>
        <p className="mb-5 text-sm text-muted">{t.sentTo.replace("{phone}", phone)}</p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="sk-label" htmlFor="code">{t.codeLabel}</label>
            <input className="sk-input text-center text-lg tracking-[0.4em]" id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
          </div>
          {error && <p className="text-sm text-danger">{t.errors[error]}</p>}
          {note && !error && <p className="text-sm text-accent">{note}</p>}
          <button type="submit" disabled={checking} className="sk-btn sk-btn-primary disabled:opacity-60">{checking ? t.verifying : t.verify}</button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[13px]">
          <button type="button" onClick={send} disabled={sending} className="text-accent hover:text-accent-hover disabled:opacity-60">{sending ? t.sending : t.resend}</button>
          <Link href="/login" className="text-faint hover:text-foreground">{t.otherNumber}</Link>
        </div>
      </div>
    </div>
  );
}
