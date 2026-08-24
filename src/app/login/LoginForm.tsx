"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary, LanguageCode } from "@/lib/i18n/dictionaries";

export function LoginForm({ dict, lang }: { dict: Dictionary["auth"]; lang: LanguageCode }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-sm p-8">
        <div className="mb-7 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Logo size="md" />
            <span className="text-lg font-semibold tracking-tight">Sendkar</span>
          </div>
          <LanguageSwitcher current={lang} compact />
        </div>

        <h1 className="mb-1 text-xl font-semibold">{dict.loginTitle}</h1>
        <p className="mb-6 text-sm text-muted">{dict.loginSubtitle}</p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="sk-label" htmlFor="phone">{dict.whatsappNumber}</label>
            <input className="sk-input font-mono" id="phone" name="phone" type="tel" placeholder="919876543210" required />
          </div>
          <div>
            <label className="sk-label" htmlFor="password">{dict.password}</label>
            <input className="sk-input" id="password" name="password" type="password" required />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <button type="submit" disabled={pending} className="sk-btn sk-btn-primary mt-1 w-full disabled:opacity-60">
            {pending ? "…" : dict.loginButton}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/signup" className="text-accent hover:text-accent-hover">{dict.noAccount}</Link>
        </p>
      </div>
    </div>
  );
}
