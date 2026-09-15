import webpush from "web-push";

/**
 * Web Push for the inbox — a browser tab has to be open and focused for
 * Supabase Realtime to surface a new message; this is what tells an agent
 * about it otherwise, including from the installed PWA / Android TWA
 * wrapper (both ride the same browser push stack). Off until configured,
 * same posture as every other integration in this repo.
 */
export function isWebPushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let configured = false;
function ensureConfigured(): void {
  if (configured) return;
  webpush.setVapidDetails(
    "mailto:support@sendkar.shop",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string; // where notificationclick should focus/open, e.g. /inbox/<contactId>
}

export interface SendPushResult {
  delivered: boolean;
  /** True on a 404/410 from the push service — the browser has unsubscribed and this row should be deleted, not retried. */
  expired: boolean;
}

export async function sendPushNotification(sub: PushSubscriptionRow, payload: PushPayload): Promise<SendPushResult> {
  if (!isWebPushConfigured()) return { delivered: false, expired: false };
  ensureConfigured();

  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
      JSON.stringify(payload),
    );
    return { delivered: true, expired: false };
  } catch (err) {
    const statusCode = (err as { statusCode?: number } | undefined)?.statusCode;
    if (statusCode === 404 || statusCode === 410) return { delivered: false, expired: true };
    throw err;
  }
}

/** Trims a message body to something reasonable for a notification, WhatsApp-caption-style. */
export function truncateForNotification(body: string, maxLength = 120): string {
  const trimmed = body.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed;
}
