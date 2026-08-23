import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generic outbound event dispatch — the "integrate with anything" answer
 * instead of building a dedicated Shopify/HubSpot/Salesforce connector for
 * each one individually. A customer points this at Zapier, Make, or their
 * own endpoint and gets the same events a native integration would fire.
 *
 * Every attempt is logged to webhook_deliveries and retried with backoff
 * inline (not fire-and-forget) — callers MUST run this inside `after()`
 * from "next/server" so the retries actually complete after the response
 * is sent, instead of the serverless function freezing mid-retry.
 */
export type OutboundEvent = "message.received" | "campaign.completed" | "contact.created";

const RETRY_DELAYS_MS = [0, 2_000, 8_000]; // 3 attempts total: immediate, +2s, +8s

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

  await Promise.allSettled(subscribed.map((webhook) => deliverWithRetry(admin, webhook, event, body)));
}

async function deliverWithRetry(
  admin: ReturnType<typeof createAdminClient>,
  webhook: { id: string; url: string; secret: string },
  event: OutboundEvent,
  body: string,
) {
  const signature = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");

  const { data: delivery } = await admin
    .from("webhook_deliveries")
    .insert({ webhook_id: webhook.id, event, payload: JSON.parse(body), status: "pending" })
    .select("id")
    .single();

  let lastError: string | null = null;
  let lastStatus: number | null = null;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    if (RETRY_DELAYS_MS[attempt] > 0) await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));

    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Sendkar-Signature": `sha256=${signature}` },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      lastStatus = res.status;

      if (res.ok) {
        if (delivery) {
          await admin
            .from("webhook_deliveries")
            .update({ status: "success", attempts: attempt + 1, response_status: res.status, delivered_at: new Date().toISOString() })
            .eq("id", delivery.id);
        }
        return;
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Request failed";
    }
  }

  // Exhausted every attempt — a down customer endpoint isn't our failure to
  // surface upstream, but it IS something the customer can see and debug.
  if (delivery) {
    await admin
      .from("webhook_deliveries")
      .update({ status: "failed", attempts: RETRY_DELAYS_MS.length, last_error: lastError, response_status: lastStatus })
      .eq("id", delivery.id);
  }
}
