import * as Sentry from "@sentry/nextjs";
import type { createAdminClient } from "@/lib/supabase/admin";
import {
  parseAccountUpdate, parseContactSync, parseHistory, parseMessageEchoes,
  type ParsedMessage,
} from "@/lib/coexistence";

type Admin = ReturnType<typeof createAdminClient>;

/** Webhook fields Meta adds for numbers running on the WhatsApp Business app and the Cloud API together. */
export const COEXISTENCE_FIELDS = new Set(["smb_message_echoes", "smb_app_state_sync", "history", "account_update"]);

const BATCH = 400;
const MAX_HISTORY_MESSAGES_PER_DELIVERY = 5_000;

/**
 * Finds or creates a contact per phone and returns phone → id. Existing
 * contacts are left exactly as they are (name, language, opt-out status).
 * Contacts that arrive this way were never asked about marketing: they are
 * tagged by `source` so a campaign can tell them apart from opted-in ones.
 */
async function ensureContacts(
  admin: Admin,
  workspaceId: string,
  people: Map<string, string | null>,
  source: string,
): Promise<Map<string, string>> {
  const phones = [...people.keys()];
  const ids = new Map<string, string>();
  for (let i = 0; i < phones.length; i += BATCH) {
    const chunk = phones.slice(i, i + BATCH);
    await admin.from("contacts").upsert(
      chunk.map((phone) => ({ workspace_id: workspaceId, phone, name: people.get(phone) ?? null, source })),
      { onConflict: "workspace_id,channel,phone", ignoreDuplicates: true },
    );
    const { data } = await admin.from("contacts").select("id, phone").eq("workspace_id", workspaceId).in("phone", chunk);
    for (const row of data ?? []) ids.set(row.phone, row.id);
  }
  return ids;
}

/** Inserts messages, skipping any whose wamid is already stored (Meta redelivers, and history overlaps live traffic). */
async function storeMessages(admin: Admin, workspaceId: string, messages: ParsedMessage[], source: string): Promise<number> {
  if (messages.length === 0) return 0;
  const people = new Map<string, string | null>();
  for (const m of messages) people.set(m.customerPhone, null);
  const contactIds = await ensureContacts(admin, workspaceId, people, source);

  const rows = messages.flatMap((m) => {
    const contactId = contactIds.get(m.customerPhone);
    return contactId
      ? [{ workspace_id: workspaceId, contact_id: contactId, direction: m.direction, body: m.body, meta_message_id: m.id, status: m.status, created_at: m.sentAt }]
      : [];
  });
  for (let i = 0; i < rows.length; i += BATCH) {
    await admin.from("messages").upsert(rows.slice(i, i + BATCH), { onConflict: "meta_message_id", ignoreDuplicates: true });
  }
  return rows.length;
}

async function handle(field: string, workspaceId: string, value: unknown, admin: Admin): Promise<void> {
  if (field === "smb_message_echoes") {
    // Something the business typed in the phone app: show it in the Sendkar inbox as an outbound message.
    await storeMessages(admin, workspaceId, parseMessageEchoes(value), "whatsapp_app_sync");
    return;
  }

  if (field === "smb_app_state_sync") {
    // New phone-book contacts come across; removals are ignored on purpose — deleting a contact here
    // would cascade away its whole conversation history.
    const people = new Map<string, string | null>();
    for (const c of parseContactSync(value)) if (c.action === "add") people.set(c.phone, c.name);
    await ensureContacts(admin, workspaceId, people, "whatsapp_app_sync");
    return;
  }

  if (field === "history") {
    const history = parseHistory(value);
    if (history.declined) {
      await admin
        .from("workspaces")
        .update({ coexistence_sync_error: "Chat history wasn't shared — you chose not to share it when connecting." })
        .eq("id", workspaceId);
      return;
    }
    await storeMessages(admin, workspaceId, history.messages.slice(0, MAX_HISTORY_MESSAGES_PER_DELIVERY), "whatsapp_app_sync");
    if (history.progress !== null) {
      await admin.from("workspaces").update({ coexistence_history_progress: Math.round(history.progress) }).eq("id", workspaceId);
    }
    return;
  }

  if (field === "account_update") {
    const update = parseAccountUpdate(value);
    if (update.disconnected) {
      // Surfaces through the existing "last send error" banner, so the owner finds out
      // instead of discovering it when a campaign silently fails.
      await admin
        .from("workspaces")
        .update({
          whatsapp_last_send_error: `WhatsApp disconnected this number from Sendkar${update.reason ? ` (${update.reason})` : ""}. Reconnect it in Channels.`,
          whatsapp_last_send_error_at: new Date().toISOString(),
        })
        .eq("id", workspaceId);
    }
  }
}

/**
 * Applies one coexistence webhook change. Never throws: Meta retries a
 * delivery that errors, which would replay the whole batch, so a bad payload
 * is reported to Sentry and dropped instead.
 */
export async function ingestCoexistenceEvent(admin: Admin, workspaceId: string, field: string, value: unknown): Promise<void> {
  try {
    await handle(field, workspaceId, value, admin);
  } catch (err) {
    Sentry.captureException(err, { tags: { workspaceId, webhookField: field } });
  }
}
