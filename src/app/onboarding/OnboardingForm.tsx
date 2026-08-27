"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveWhatsAppCreds, skipOnboarding, type OnboardingResult } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: OnboardingResult = {};

export function OnboardingForm({ t }: { t: Dictionary["onboarding"] }) {
  const [state, formAction, pending] = useActionState(saveWhatsAppCreds, initialState);
  const router = useRouter();

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="sk-card w-full max-w-md p-8 text-center">
          <div className="mb-3 text-3xl">✓</div>
          <h1 className="mb-1 text-xl font-semibold">{t.successTitle}{state.verifiedName ? `${t.successAs}${state.verifiedName}` : ""}</h1>
          <p className="mb-6 text-sm text-muted">{t.successBody}</p>
          {state.warning && (
            <div className="mb-6 rounded-md border border-warn/30 bg-warn/5 p-3 text-left text-[12.5px] text-foreground">{state.warning}</div>
          )}
          <button onClick={() => router.push("/dashboard")} className="sk-btn sk-btn-primary w-full">{t.continueButton}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="sk-card w-full max-w-lg p-8">
        <h1 className="mb-1 text-xl font-semibold">{t.title}</h1>
        <p className="mb-6 text-sm text-muted">
          {t.introBefore}{" "}
          <button type="button" onClick={() => skipOnboarding()} className="text-accent hover:text-accent-hover">{t.skipLabel}</button>{" "}
          {t.introAfter}
        </p>

        <div className="mb-5 rounded-md border border-warn/30 bg-warn/5 p-3 text-[12.5px] text-foreground">{t.numberWarning}</div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-dim text-[11px] text-accent">1</div>
            <div className="flex-1">
              <div className="mb-1 text-[13.5px] font-medium">{t.step1Title}</div>
              <p className="mb-2 text-[12px] text-faint">{t.step1Body}</p>
              <div className="flex flex-col gap-2">
                <input name="phoneNumberId" className="sk-input font-mono text-sm" placeholder={t.phoneIdPlaceholder} required />
                <input name="wabaId" className="sk-input font-mono text-sm" placeholder={t.wabaIdPlaceholder} required />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-dim text-[11px] text-accent">2</div>
            <div className="flex-1">
              <div className="mb-1 text-[13.5px] font-medium">{t.step2Title}</div>
              <p className="mb-2 text-[12px] text-faint">{t.step2Body}</p>
              <input name="accessToken" type="password" className="sk-input font-mono text-sm" placeholder={t.tokenPlaceholder} required />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-dim text-[11px] text-accent">3</div>
            <div className="flex-1">
              <div className="mb-1 text-[13.5px] font-medium">{t.step3Title}</div>
              <p className="text-[12px] text-faint">{t.step3Body}</p>
            </div>
          </div>

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <button type="submit" disabled={pending} className="sk-btn sk-btn-primary w-full disabled:opacity-60">
            {pending ? t.submitPending : t.submitButton}
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] text-faint">
          {t.noMetaApp} <Link href="https://developers.facebook.com/apps" target="_blank" className="text-accent hover:text-accent-hover">{t.createOne}</Link>
        </p>
      </div>
    </div>
  );
}
