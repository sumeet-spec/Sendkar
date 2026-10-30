"use client";

import { useActionState, useState } from "react";
import { savePayMode } from "./actions";
import type { PayMode } from "@/lib/bills/pay";
import type { PaySettingsUi } from "@/lib/i18n/settingsCopy";

export function PayModeCard({
  t, initialMode, upiId, upiName, payLink, gatewayConnected,
}: { t: PaySettingsUi; initialMode: PayMode | null; upiId: string; upiName: string; payLink: string; gatewayConnected: boolean }) {
  const [state, formAction, pending] = useActionState(savePayMode, null);
  const [mode, setMode] = useState<string>(initialMode ?? "upi");

  const option = (value: string, title: string, body: string) => (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${mode === value ? "border-accent" : "border-border"}`}>
      <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="mt-1" />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="block text-[12.5px] text-faint">{body}</span>
        {mode === value && value === "upi" && (
          <span className="mt-2 grid gap-2 sm:grid-cols-2">
            <input name="upiId" defaultValue={upiId} placeholder={t.upiIdPh} className="sk-input text-[15px]" autoComplete="off" />
            <input name="upiName" defaultValue={upiName} placeholder={t.upiNamePh} maxLength={40} className="sk-input text-[15px]" />
          </span>
        )}
        {mode === value && value === "link" && (
          <input name="payLink" defaultValue={payLink} placeholder={t.linkPh} className="sk-input mt-2 text-[15px]" autoComplete="off" />
        )}
        {mode === value && value === "gateway" && !gatewayConnected && (
          <span className="mt-2 block text-[12.5px] text-danger">{t.gatewayFirst}</span>
        )}
      </span>
    </label>
  );

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-4">
      <div>
        <div className="font-medium">{t.modeTitle}</div>
        <p className="text-[12.5px] text-faint">{t.modeIntro}</p>
      </div>
      {option("upi", t.upiTitle, t.upiBody)}
      {option("gateway", t.gatewayTitle, t.gatewayBody)}
      {option("link", t.linkTitle, t.linkBody)}
      {option("none", t.noneTitle, t.noneBody)}
      {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
      {state?.success && <p className="text-[13px] text-accent">{t.saved}</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{pending ? "…" : t.save}</button>
    </form>
  );
}
