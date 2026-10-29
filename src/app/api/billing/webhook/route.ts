import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PAID_PLANS, type Plan } from "@/lib/plans";
import { imagePackFromMetadata } from "@/lib/billing";

// Standard-webhooks signature: HMAC-SHA256 over `${id}.${timestamp}.${payload}`,
// keyed by the base64 part of the whsec_ secret. Same scheme Continuum's Dodo
// webhook already uses — Dodo signs every webhook this way regardless of
// which product it's billing for.
function verifySignature(secret: string, msgId: string, timestamp: string, payload: string, sigHeader: string): boolean {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  const expected = crypto.createHmac("sha256", key).update(`${msgId}.${timestamp}.${payload}`).digest("base64");
  const expectedBuf = Buffer.from(expected);

  return sigHeader.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}

interface DodoEvent {
  type?: string;
  data?: { metadata?: Record<string, string>; payment_id?: string };
  metadata?: Record<string, string>;
}

const UPGRADE_EVENTS = new Set(["payment.succeeded", "subscription.active", "subscription.renewed"]);
const DOWNGRADE_EVENTS = new Set(["subscription.cancelled", "subscription.expired", "subscription.revoked"]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headerId = request.headers.get("webhook-id") ?? request.headers.get("svix-id") ?? "";
  const headerTs = request.headers.get("webhook-timestamp") ?? request.headers.get("svix-timestamp") ?? "";
  const headerSig = request.headers.get("webhook-signature") ?? request.headers.get("svix-signature") ?? "";

  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (secret && secret.length > 10) {
    if (!headerId || !headerTs || !headerSig || !verifySignature(secret, headerId, headerTs, rawBody, headerSig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: DodoEvent;
  try {
    event = JSON.parse(rawBody) as DodoEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();
  const eventType = event.type ?? "";
  const dedupeId = headerId;

  if (dedupeId) {
    const { error: insertErr } = await admin.from("processed_dodo_webhooks").insert({ id: dedupeId });
    if (insertErr) {
      // Unique violation = we've already handled this delivery.
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  const metadata = event.data?.metadata ?? event.metadata ?? {};
  const workspaceId = metadata["workspace_id"];
  const metadataPlan = metadata["plan"] as Plan | undefined;
  const eventTs = Number(headerTs);
  const eventTime = Number.isFinite(eventTs) ? new Date(eventTs * 1000).toISOString() : null;

  try {
    // An image pack is a one-time purchase, not a plan change: credit the images and stop.
    const pack = workspaceId && eventType === "payment.succeeded" ? imagePackFromMetadata(metadata) : null;
    if (pack && workspaceId) {
      const paymentId = event.data?.payment_id ?? headerId;
      const { error: creditError } = await admin.from("image_pack_purchases").insert({
        workspace_id: workspaceId,
        images: pack.images,
        pack: pack.key,
        provider_payment_id: paymentId,
      });
      // 23505 = this payment was already credited (a redelivery): fine. Anything else must be retried.
      if (creditError && creditError.code !== "23505") throw new Error(creditError.message);
      return NextResponse.json({ received: true, creditedImages: pack.images });
    }

    const isPlanChange = workspaceId && (UPGRADE_EVENTS.has(eventType) || DOWNGRADE_EVENTS.has(eventType));
    if (isPlanChange) {
      // Dedup only stops the same delivery twice — this stops a genuinely
      // older event, redelivered late, from undoing a newer one that
      // already landed (e.g. a late "renewed" re-upgrading a workspace a
      // more recent "cancelled" already downgraded).
      const { data: ws } = await admin.from("workspaces").select("plan_synced_at").eq("id", workspaceId).maybeSingle();
      const isStale = eventTime && ws?.plan_synced_at && eventTime < ws.plan_synced_at;
      if (!isStale) {
        if (UPGRADE_EVENTS.has(eventType) && metadataPlan && PAID_PLANS.includes(metadataPlan)) {
          await admin.from("workspaces").update({ plan: metadataPlan, plan_synced_at: eventTime }).eq("id", workspaceId);
        } else if (DOWNGRADE_EVENTS.has(eventType)) {
          await admin.from("workspaces").update({ plan: "free", plan_synced_at: eventTime }).eq("id", workspaceId);
        }
      }
    }
  } catch (err) {
    if (dedupeId) await admin.from("processed_dodo_webhooks").delete().eq("id", dedupeId);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
