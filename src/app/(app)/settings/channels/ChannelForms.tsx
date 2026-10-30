"use client";

import { useActionState } from "react";
import { saveInstagramCreds, saveMessengerCreds, saveWhatsAppCredsFromChannels } from "./actions";
import type { Workspace } from "@/lib/workspace";
import type { ChannelsUi } from "@/lib/i18n/channelsCopy";

export function WhatsAppForm({ t, workspace }: { t: ChannelsUi; workspace: Workspace }) {
  const [state, formAction, pending] = useActionState(saveWhatsAppCredsFromChannels, null);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="mb-1 font-medium">{t.waTitle}</div>
      <div>
        <label className="sk-label">{t.phoneNumberId}</label>
        <input name="phoneNumberId" defaultValue={workspace.whatsapp_phone_number_id ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">{t.wabaId}</label>
        <input name="wabaId" defaultValue={workspace.whatsapp_waba_id ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">{t.displayNumber}</label>
        <input name="displayNumber" defaultValue={workspace.whatsapp_display_number ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">{t.catalogId}</label>
        <input name="catalogId" defaultValue={workspace.catalog_id ?? ""} className="sk-input font-mono text-sm" />
      </div>
      <div>
        <label className="sk-label">{t.token}</label>
        <input
          name="accessToken"
          type="password"
          placeholder={workspace.whatsapp_access_token ? t.tokenSet : "EAAG..."}
          className="sk-input font-mono text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.warning && <p className="text-sm text-warn">{state.warning}</p>}
      {state?.success && !state.warning && <p className="text-sm text-accent">{t.savedVerified}</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? t.verifying : t.save}
      </button>
    </form>
  );
}

function PageForm({
  t, title, pageId, hasToken, locked, action,
}: {
  t: ChannelsUi; title: string; pageId: string; hasToken: boolean; locked: boolean;
  action: (prev: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-medium">{title}</span>
        {locked && <span className="sk-pill">{t.locked}</span>}
      </div>
      <div>
        <label className="sk-label">{t.pageId}</label>
        <input name="pageId" defaultValue={pageId} disabled={locked} className="sk-input font-mono text-sm disabled:opacity-50" />
      </div>
      <div>
        <label className="sk-label">{t.pageToken}</label>
        <input
          name="accessToken"
          type="password"
          placeholder={hasToken ? t.tokenSet : "EAAG..."}
          disabled={locked}
          className="sk-input font-mono text-sm disabled:opacity-50"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">{t.saved}</p>}
      <button type="submit" disabled={pending || locked} className="sk-btn sk-btn-primary disabled:opacity-50">
        {pending ? t.saving : t.save}
      </button>
    </form>
  );
}

export function InstagramForm({ t, workspace, locked }: { t: ChannelsUi; workspace: Workspace; locked: boolean }) {
  return <PageForm t={t} title={t.igTitle} pageId={workspace.instagram_page_id ?? ""} hasToken={Boolean(workspace.instagram_access_token)} locked={locked} action={saveInstagramCreds} />;
}

export function MessengerForm({ t, workspace, locked }: { t: ChannelsUi; workspace: Workspace; locked: boolean }) {
  return <PageForm t={t} title={t.msgrTitle} pageId={workspace.messenger_page_id ?? ""} hasToken={Boolean(workspace.messenger_access_token)} locked={locked} action={saveMessengerCreds} />;
}
