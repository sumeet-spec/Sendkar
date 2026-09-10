"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { requestReset, confirmReset } from "./actions";
import { Logo } from "@/components/Logo";

export function ForgotPasswordForm() {
  const [requestState, requestAction, requestPending] = useActionState(requestReset, null);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmReset, null);
  const [phone, setPhone] = useState("");

  const codeSent = Boolean(requestState?.success);
  const done = Boolean(confirmState?.success);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-sm p-8">
        <div className="mb-7 flex items-center gap-2.5">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight">Sendkar</span>
        </div>

        {done ? (
          <>
            <h1 className="mb-1 text-xl font-semibold">Password updated</h1>
            <p className="mb-6 text-sm text-muted">You can log in with your new password now.</p>
            <Link href="/login" className="sk-btn sk-btn-primary block w-full text-center">Go to login</Link>
          </>
        ) : !codeSent ? (
          <>
            <h1 className="mb-1 text-xl font-semibold">Forgot password?</h1>
            <p className="mb-6 text-sm text-muted">We&apos;ll send a 6-digit code to your WhatsApp number.</p>
            <form action={requestAction} className="flex flex-col gap-4">
              <div>
                <label className="sk-label" htmlFor="phone">WhatsApp number</label>
                <div className="flex items-center gap-2">
                  <span className="sk-input flex w-16 items-center justify-center font-mono text-faint">+91</span>
                  <input
                    className="sk-input font-mono"
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              {requestState?.error && <p className="text-sm text-danger">{requestState.error}</p>}
              <button type="submit" disabled={requestPending} className="sk-btn sk-btn-primary mt-1 w-full disabled:opacity-60">
                {requestPending ? "…" : "Send code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold">Enter the code</h1>
            <p className="mb-6 text-sm text-muted">Sent to your WhatsApp — it expires in 10 minutes.</p>
            <form action={confirmAction} className="flex flex-col gap-4">
              <input type="hidden" name="phone" value={phone} />
              <div>
                <label className="sk-label" htmlFor="code">6-digit code</label>
                <input className="sk-input font-mono" id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required />
              </div>
              <div>
                <label className="sk-label" htmlFor="password">New password</label>
                <input className="sk-input" id="password" name="password" type="password" minLength={6} required />
              </div>
              {confirmState?.error && <p className="text-sm text-danger">{confirmState.error}</p>}
              <button type="submit" disabled={confirmPending} className="sk-btn sk-btn-primary mt-1 w-full disabled:opacity-60">
                {confirmPending ? "…" : "Set new password"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-accent hover:text-accent-hover">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
