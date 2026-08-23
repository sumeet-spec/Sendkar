/**
 * Instagram Direct messaging — rides the same Meta App as WhatsApp, but a
 * different connected asset: a Facebook Page linked to an Instagram
 * professional account, not a phone number. Sending goes through the
 * Page's own Graph API node.
 *
 * Flagging honestly: this was built to the same pattern as lib/whatsapp.ts
 * (gated until configured, same Graph API shape) but the exact endpoint/
 * scopes here weren't verified against a live Instagram Business account
 * the way WhatsApp's were earlier this session — worth a docs check
 * (developers.facebook.com/docs/messenger-platform/instagram) before the
 * first real send, not just trusting this file blind.
 */

const GRAPH_API_VERSION = "v22.0";

export class InstagramNotConfiguredError extends Error {
  constructor() {
    super("This workspace hasn't connected an Instagram account yet.");
    this.name = "InstagramNotConfiguredError";
  }
}

export interface InstagramCreds {
  instagram_page_id: string | null;
  instagram_access_token: string | null;
}

function requireCreds(ws: InstagramCreds): { pageId: string; token: string } {
  if (!ws.instagram_page_id || !ws.instagram_access_token) throw new InstagramNotConfiguredError();
  return { pageId: ws.instagram_page_id, token: ws.instagram_access_token };
}

export interface SendInstagramMessageInput {
  workspace: InstagramCreds;
  recipientId: string; // the sender's Instagram-scoped id (IGSID), from an inbound webhook
  body: string;
}

export async function sendInstagramMessage(input: SendInstagramMessageInput) {
  const { pageId, token } = requireCreds(input.workspace);

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: input.recipientId },
      message: { text: input.body },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json()) as { message_id?: string; error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Instagram API error (HTTP ${res.status})`);
  if (!json.message_id) throw new Error("Instagram API accepted the request but returned no message id.");
  return { metaMessageId: json.message_id };
}

export function isInstagramConfigured(ws: InstagramCreds): boolean {
  return Boolean(ws.instagram_page_id && ws.instagram_access_token);
}
