/**
 * Facebook Messenger — same Graph API "Page sends a message" shape as
 * Instagram (lib/instagram.ts), just addressed to a Messenger PSID instead
 * of an Instagram-scoped id. A business can connect a Page for Messenger
 * independently of whether they also connect one for Instagram, so this
 * uses its own credential pair rather than assuming they're the same Page.
 */

const GRAPH_API_VERSION = "v22.0";

export class MessengerNotConfiguredError extends Error {
  constructor() {
    super("This workspace hasn't connected a Facebook Page for Messenger yet.");
    this.name = "MessengerNotConfiguredError";
  }
}

export interface MessengerCreds {
  messenger_page_id: string | null;
  messenger_access_token: string | null;
}

function requireCreds(ws: MessengerCreds): { pageId: string; token: string } {
  if (!ws.messenger_page_id || !ws.messenger_access_token) throw new MessengerNotConfiguredError();
  return { pageId: ws.messenger_page_id, token: ws.messenger_access_token };
}

export interface SendMessengerInput {
  workspace: MessengerCreds;
  recipientId: string; // Page-scoped id (PSID), from an inbound webhook
  body: string;
}

export async function sendMessengerMessage(input: SendMessengerInput) {
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
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Messenger API error (HTTP ${res.status})`);
  if (!json.message_id) throw new Error("Messenger API accepted the request but returned no message id.");
  return { metaMessageId: json.message_id };
}

export function isMessengerConfigured(ws: MessengerCreds): boolean {
  return Boolean(ws.messenger_page_id && ws.messenger_access_token);
}
