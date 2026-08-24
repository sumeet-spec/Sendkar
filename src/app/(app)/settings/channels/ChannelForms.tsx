"use client";

import { useActionState } from "react";
import { saveInstagramCreds, saveMessengerCreds, saveWhatsAppCredsFromChannels } from "./actions";
import type { Workspace } from "@/lib/workspace";

export function WhatsAppForm({ workspace }: { workspace: Workspace }) {
  const [state, formAction, pending] = useActionState(saveWhatsAppCredsFromChannels, null);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="mb-1 font-medium">WhatsApp</div>
      <div>
        <label className="sk-label">Phone number ID</label>
        <input name="phoneNumberId" defaultValue={workspace.whatsapp_phone_number_id ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">WhatsApp Business Account ID</label>
        <input name="wabaId" defaultValue={workspace.whatsapp_waba_id ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">Display number (E.164, e.g. 919876543210 — for click-to-chat links)</label>
        <input name="displayNumber" defaultValue={workspace.whatsapp_display_number ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">Commerce catalog ID (optional — from Meta Commerce Manager, for the product catalog)</label>
        <input name="catalogId" defaultValue={workspace.catalog_id ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">System user access token</label>
        <input
          name="accessToken"
          type="password"
          placeholder={workspace.whatsapp_access_token ? "•••••••• (set — enter a new token to replace it)" : "EAAG..."}
          className="sk-input font-mono text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.warning && <p className="text-sm text-warn">{state.warning}</p>}
      {state?.success && !state.warning && <p className="text-sm text-accent">Saved and verified with Meta.</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Verifying…" : "Save"}
      </button>
    </form>
  );
}

export function InstagramForm({ workspace, locked }: { workspace: Workspace; locked: boolean }) {
  const [state, formAction, pending] = useActionState(saveInstagramCreds, null);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-medium">Instagram</span>
        {locked && <span className="sk-pill">Growth plan+</span>}
      </div>
      <div>
        <label className="sk-label">Connected Page ID</label>
        <input name="pageId" defaultValue={workspace.instagram_page_id ?? ""} disabled={locked} className="sk-input font-mono text-sm disabled:opacity-50" />
      </div>
      <div>
        <label className="sk-label">Page access token</label>
        <input
          name="accessToken"
          type="password"
          placeholder={workspace.instagram_access_token ? "•••••••• (set — enter a new token to replace it)" : "EAAG..."}
          disabled={locked}
          className="sk-input font-mono text-sm disabled:opacity-50"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">Saved.</p>}
      <button type="submit" disabled={pending || locked} className="sk-btn sk-btn-primary disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function MessengerForm({ workspace, locked }: { workspace: Workspace; locked: boolean }) {
  const [state, formAction, pending] = useActionState(saveMessengerCreds, null);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-medium">Facebook Messenger</span>
        {locked && <span className="sk-pill">Growth plan+</span>}
      </div>
      <div>
        <label className="sk-label">Connected Page ID</label>
        <input name="pageId" defaultValue={workspace.messenger_page_id ?? ""} disabled={locked} className="sk-input font-mono text-sm disabled:opacity-50" />
      </div>
      <div>
        <label className="sk-label">Page access token</label>
        <input
          name="accessToken"
          type="password"
          placeholder={workspace.messenger_access_token ? "•••••••• (set — enter a new token to replace it)" : "EAAG..."}
          disabled={locked}
          className="sk-input font-mono text-sm disabled:opacity-50"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">Saved.</p>}
      <button type="submit" disabled={pending || locked} className="sk-btn sk-btn-primary disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
