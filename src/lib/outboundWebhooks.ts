import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generic outbound event dispatch — the "integrate with anything" answer
 * instead of building a dedicated Shopify/HubSpot/Salesforce connector for
 * each one individually. A customer points this at Zapier, Make, or their
 * own endpoint and gets the same events a native integration would fire.
 */
export type OutboundEvent = "message.received" | "campaign.completed" | "contact.created";

export async function dispatchOutboundWebhooks(
  workspaceId: string,
  event: OutboundEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  const admin = createAdminClient();

  const { data: webhooks } = await admin
    .from("outbound_webhooks")
    .select("id, url, secret, events")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true);

  const subscribed = (webhooks ?? []).filter((w) => (w.events as string[]).includes(event));
  if (subscribed.length === 0) return;

  const body = JSON.stringify({ event, data: payload, sentAt: new Date().toISOString() });

  await Promise.allSettled(
    subscribed.map(async (webhook) => {
      const signature = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");
      try {
        await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Sendkar-Signature": `sha256=${signature}` },
          body,
          signal: AbortSignal.timeout(10_000),
        });
      } catch {
        // Best-effort — a customer's endpoint being down isn't our failure to surface upstream.
      }
    }),
  );
}
