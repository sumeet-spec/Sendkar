"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveWhatsAppCreds, skipOnboarding, type OnboardingResult } from "./actions";

const initialState: OnboardingResult = {};

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(saveWhatsAppCreds, initialState);
  const router = useRouter();

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="sk-card w-full max-w-md p-8 text-center">
          <div className="mb-3 text-3xl">✓</div>
          <h1 className="mb-1 text-xl font-semibold">Connected{state.verifiedName ? ` as ${state.verifiedName}` : ""}</h1>
          <p className="mb-6 text-sm text-muted">Meta confirmed these credentials actually work — not just saved, verified.</p>
          {state.warning && (
            <div className="mb-6 rounded-md border border-warn/30 bg-warn/5 p-3 text-left text-[12.5px] text-foreground">{state.warning}</div>
          )}
          <button onClick={() => router.push("/dashboard")} className="sk-btn sk-btn-primary w-full">Continue to dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="sk-card w-full max-w-lg p-8">
        <h1 className="mb-1 text-xl font-semibold">Connect WhatsApp</h1>
        <p className="mb-6 text-sm text-muted">
          Three things from Meta Business Manager. Don&apos;t have a WhatsApp Business number yet?{" "}
          <button type="button" onClick={() => skipOnboarding()} className="text-accent hover:text-accent-hover">Skip this</button> —
          everything else in Sendkar already works, sending just stays off until this is filled in.
        </p>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-dim text-[11px] text-accent">1</div>
            <div className="flex-1">
              <div className="mb-1 text-[13.5px] font-medium">Get your Phone Number ID and WABA ID</div>
              <p className="mb-2 text-[12px] text-faint">
                In your Meta App → WhatsApp → API Setup, you&apos;ll see a &quot;From&quot; phone number with its
                Phone number ID beneath it, and a WhatsApp Business Account ID field nearby.
              </p>
              <div className="flex flex-col gap-2">
                <input name="phoneNumberId" className="sk-input font-mono text-sm" placeholder="Phone number ID — e.g. 102938475600000" required />
                <input name="wabaId" className="sk-input font-mono text-sm" placeholder="WhatsApp Business Account ID" required />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-dim text-[11px] text-accent">2</div>
            <div className="flex-1">
              <div className="mb-1 text-[13.5px] font-medium">Get an access token</div>
              <p className="mb-2 text-[12px] text-faint">
                The temporary token on that same API Setup page works for testing (expires in 24h). For real use,
                create a System User in Meta Business Settings, assign it this app with{" "}
                <span className="font-mono">whatsapp_business_messaging</span> and{" "}
                <span className="font-mono">whatsapp_business_management</span> permissions, and generate its token there instead.
              </p>
              <input name="accessToken" type="password" className="sk-input font-mono text-sm" placeholder="EAAG..." required />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-dim text-[11px] text-accent">3</div>
            <div className="flex-1">
              <div className="mb-1 text-[13.5px] font-medium">We verify it, live</div>
              <p className="text-[12px] text-faint">
                Sendkar checks these credentials against Meta&apos;s API before saving, and subscribes your WABA to
                receive replies and delivery statuses — the two steps most WhatsApp platforms skip, which is why
                &quot;connected&quot; sometimes doesn&apos;t mean messages actually flow both ways.
              </p>
            </div>
          </div>

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <button type="submit" disabled={pending} className="sk-btn sk-btn-primary w-full disabled:opacity-60">
            {pending ? "Verifying with Meta…" : "Connect & verify"}
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] text-faint">
          No Meta app yet? <Link href="https://developers.facebook.com/apps" target="_blank" className="text-accent hover:text-accent-hover">Create one at developers.facebook.com →</Link>
        </p>
      </div>
    </div>
  );
}
