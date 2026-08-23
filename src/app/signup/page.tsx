"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-sm p-8">
        <div className="mb-7 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
              <path d="M3 10l7-7 7 7M3 10l7 7 7-7" stroke="#05130a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Sendkar</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold">Create your workspace</h1>
        <p className="mb-6 text-sm text-muted">WhatsApp campaigns, delivery tracking, and a shared inbox.</p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="sk-label" htmlFor="workspaceName">Workspace name</label>
            <input className="sk-input" id="workspaceName" name="workspaceName" placeholder="Instastarz" required />
          </div>
          <div>
            <label className="sk-label" htmlFor="phone">WhatsApp number (with country code)</label>
            <input className="sk-input font-mono" id="phone" name="phone" type="tel" placeholder="919876543210" required />
          </div>
          <div>
            <label className="sk-label" htmlFor="password">Password</label>
            <input className="sk-input" id="password" name="password" type="password" minLength={8} required />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <button type="submit" disabled={pending} className="sk-btn sk-btn-primary mt-1 w-full disabled:opacity-60">
            {pending ? "Creating…" : "Create workspace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="text-accent hover:text-accent-hover">Log in</Link>
        </p>
      </div>
    </div>
  );
}
