"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "sk_push_prompt_dismissed";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** PushManager wants the VAPID key as a raw Uint8Array, not the base64url string it's distributed as. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function subscribe(): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY) return false;
  const registration = await navigator.serviceWorker.register("/sw.js");
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? (await registration.pushManager.subscribe({
    userVisibleOnly: true,
    // @types/node's Uint8Array<ArrayBufferLike> vs lib.dom's plain-ArrayBuffer
    // BufferSource is a known type-only friction point, not a real mismatch —
    // this is a real Uint8Array either way.
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  }));

  const json = subscription.toJSON();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  });
  return res.ok;
}

/**
 * A one-time, dismissible banner offering push notifications for new inbox
 * messages — Realtime only updates an open tab, this is what reaches an
 * agent who's tabbed away or on the installed app. Renders nothing at all
 * when web push isn't configured, permission was already decided, or the
 * browser doesn't support it (no fallback UI to maintain for that case).
 */
export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      // Already granted in an earlier session — keep the subscription fresh
      // silently, no need to ask again.
      subscribe().catch(() => {});
      return;
    }
    if (Notification.permission === "denied") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 border-t border-border bg-surface/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-between sm:px-6">
      <p className="text-[12.5px] text-muted">
        Get notified when a new message comes in, even when this tab isn&apos;t open.
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, "1");
            setVisible(false);
          }}
          className="sk-btn sk-btn-ghost px-4 py-2 text-[13px]"
        >
          Not now
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const permission = await Notification.requestPermission();
              if (permission === "granted") await subscribe();
            } finally {
              localStorage.setItem(DISMISSED_KEY, "1");
              setVisible(false);
              setBusy(false);
            }
          }}
          className="sk-btn sk-btn-primary px-4 py-2 text-[13px]"
        >
          Enable notifications
        </button>
      </div>
    </div>
  );
}
