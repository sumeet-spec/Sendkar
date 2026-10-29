"use client";

import { useActionState, useState } from "react";
import { savePayMode } from "./actions";
import type { PayMode } from "@/lib/bills/pay";

export function PayModeCard({
  initialMode, upiId, upiName, payLink, gatewayConnected,
}: { initialMode: PayMode | null; upiId: string; upiName: string; payLink: string; gatewayConnected: boolean }) {
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
            <input name="upiId" defaultValue={upiId} placeholder="your UPI ID, like sharma@okhdfcbank" className="sk-input text-[15px]" autoComplete="off" />
            <input name="upiName" defaultValue={upiName} placeholder="Name customers see, like Sharma Traders" maxLength={40} className="sk-input text-[15px]" />
          </span>
        )}
        {mode === value && value === "link" && (
          <input name="payLink" defaultValue={payLink} placeholder="https://rzp.io/l/your-link" className="sk-input mt-2 text-[15px]" autoComplete="off" />
        )}
        {mode === value && value === "gateway" && !gatewayConnected && (
          <span className="mt-2 block text-[12.5px] text-danger">Connect Razorpay or PayU below first.</span>
        )}
      </span>
    </label>
  );

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-4">
      <div>
        <div className="font-medium">How customers pay you</div>
        <p className="text-[12.5px] text-faint">
          Bills that are not paid yet carry a &quot;Pay now&quot; button on WhatsApp. Pick the way that suits your shop.
        </p>
      </div>
      {option("upi", "My UPI ID", "Nothing to connect. The customer's UPI app opens with the amount filled in. You mark the bill paid when the money arrives.")}
      {option("gateway", "Razorpay or PayU", "Connect your account below. Payment is confirmed automatically and the bill is marked paid.")}
      {option("link", "A payment link I paste", "Use any payment link you already have. You mark the bill paid when the money arrives.")}
      {option("none", "No payment button", "Bills go out without a way to pay.")}
      {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
      {state?.success && <p className="text-[13px] text-accent">Saved.</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{pending ? "…" : "Save"}</button>
    </form>
  );
}
