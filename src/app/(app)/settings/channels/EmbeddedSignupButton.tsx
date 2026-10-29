"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { completeEmbeddedSignup, type EmbeddedSignupResult } from "./embeddedSignupActions";

declare global {
  interface Window {
    FB?: {
      init: (opts: { appId: string; autoLogAppEvents?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } }) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

/**
 * True inside the installed Android app (Sendkar's app is the website in a full-screen shell). Meta's connect window is a
 * popup, and popups can behave differently inside that shell, so the page offers a way out to the normal browser there.
 * Always false on the server and on first render, so nothing differs between the two.
 */
function useInstalledAndroidApp(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => window.matchMedia("(display-mode: standalone)").matches && /Android/i.test(navigator.userAgent),
    () => false,
  );
}

interface SignupData {
  wabaId: string | null;
  phoneNumberId: string | null;
  event: string;
}

// Meta's popup reports the new account through a postMessage that can land
// before OR after FB.login's own callback, so the callback waits briefly for it.
const SIGNUP_EVENT_WAIT_MS = 10_000;
const POLL_MS = 150;

/**
 * Meta's Embedded Signup — a self-serve alternative to the manual
 * phone-number-id + access-token form below, so a non-technical business
 * owner never has to open Meta Business Manager or copy a token by hand.
 *
 * It also offers Meta's "connect an existing WhatsApp Business app account"
 * option (coexistence): the same number keeps working in the phone app while
 * Sendkar sends and receives through the Cloud API.
 *
 * Needs a real Meta App (NEXT_PUBLIC_META_APP_ID) with a WhatsApp Embedded
 * Signup configuration (META_EMBEDDED_SIGNUP_CONFIG_ID) set up in Meta
 * Business Manager, Tech Provider status, and — to work for anyone other than
 * the app's own test users — Meta App Review approval for
 * whatsapp_business_management and whatsapp_business_messaging. That review is
 * an external, asynchronous process on Meta's side; this component is what runs
 * once it's approved, not a way around needing it. Renders nothing if the env
 * vars aren't set.
 */
export function EmbeddedSignupButton({ workspaceId, blockedReason }: { workspaceId: string; blockedReason?: string | null }) {
  const configured = Boolean(process.env.NEXT_PUBLIC_META_APP_ID && process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID);
  const [sdkReady, setSdkReady] = useState(() => typeof window !== "undefined" && Boolean(window.FB));
  const [status, setStatus] = useState<EmbeddedSignupResult | null>(null);
  const [pending, setPending] = useState(false);
  // A ref, not state: FB.login's callback runs long after the render that created it, so
  // state read inside it would still be the pre-popup value (always empty).
  const signupRef = useRef<SignupData | null>(null);
  const inApp = useInstalledAndroidApp();

  useEffect(() => {
    if (!configured || typeof window === "undefined" || window.FB) {
      return;
    }

    window.fbAsyncInit = () => {
      window.FB!.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID!, xfbml: false, version: "v22.0" });
      setSdkReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
      let data: { type?: string; event?: string; data?: Record<string, unknown> };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return; // Not every message on the page is Meta's signup payload.
      }
      if (data?.type !== "WA_EMBEDDED_SIGNUP") return;

      const name = String(data.event ?? "");
      if (name.startsWith("FINISH")) {
        signupRef.current = {
          wabaId: typeof data.data?.waba_id === "string" ? data.data.waba_id : null,
          phoneNumberId: typeof data.data?.phone_number_id === "string" ? data.data.phone_number_id : null,
          event: name,
        };
      } else if (name === "CANCEL") {
        setStatus({ error: "Signup was cancelled before it finished." });
        setPending(false);
      } else if (name === "ERROR") {
        setStatus({ error: typeof data.data?.error_message === "string" ? data.data.error_message : "Meta reported an error during signup." });
        setPending(false);
      }
    };
    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, [configured]);

  if (!configured) return null;

  async function waitForSignupData(): Promise<SignupData | null> {
    const deadline = Date.now() + SIGNUP_EVENT_WAIT_MS;
    while (Date.now() < deadline) {
      if (signupRef.current) return signupRef.current;
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    return signupRef.current;
  }

  function handleLogin() {
    // Checked before the popup on purpose: Meta converts the number the moment the popup finishes,
    // so refusing afterwards would leave someone with a number we will not accept.
    if (!window.FB || blockedReason) return;
    setPending(true);
    setStatus(null);
    signupRef.current = null;
    window.FB.login(
      // Must be a plain (non-async) function — Facebook's own SDK rejects an
      // async callback outright ("Expression is of type asyncfunction, not
      // function"), so the async work below runs via .then() instead of
      // making this callback itself async.
      (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setStatus({ error: "Signup was cancelled or didn't complete." });
          setPending(false);
          return;
        }
        waitForSignupData()
          .then((signup) =>
            signup
              ? completeEmbeddedSignup(workspaceId, code, signup.wabaId, signup.phoneNumberId, signup.event)
              : ({ error: "Meta didn't report a WhatsApp Business Account — try again." } satisfies EmbeddedSignupResult),
          )
          .then((result) => setStatus(result))
          .catch(() => setStatus({ error: "Something went wrong while connecting — please try again." }))
          .finally(() => setPending(false));
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" },
      },
    );
  }

  return (
    <div className="sk-card p-4">
      <div className="mb-1 font-medium">Connect with Facebook</div>
      <p className="mb-3 text-[12.5px] text-faint">
        The recommended path — no phone-number-id or access token to find and paste. Opens Meta&apos;s own signup
        flow in a popup.
      </p>
      <div className="mb-3 rounded-md border border-accent/30 bg-accent/5 p-2.5 text-[12px] text-foreground">
        <div className="mb-1 font-medium">Already use the WhatsApp Business app?</div>
        <p>
          Choose <strong>connect your existing WhatsApp Business account</strong> in the popup. Your number keeps
          working in the app, recent chats and contacts come across, and Sendkar adds reminders, broadcasts and a
          shared inbox on top. You need app version 2.24.17 or newer and a number that has been in use on the app for
          at least 7 days. Groups, status and calls stay in the app, and broadcast lists there become read-only.
        </p>
      </div>
      <p className="mb-3 rounded-md border border-warn/30 bg-warn/5 p-2.5 text-[12px] text-foreground">
        Using the regular WhatsApp (not Business) app? Switch to the Business app first — your chats move with you —
        or connect a separate number here instead. Connecting a number that isn&apos;t on the Business app moves it to
        Sendkar and logs it out of the app.
      </p>
      <button
        onClick={handleLogin}
        disabled={!sdkReady || pending || Boolean(blockedReason)}
        className="sk-btn sk-btn-primary disabled:opacity-60"
      >
        {pending ? "Connecting…" : sdkReady ? "Continue with Facebook" : "Loading…"}
      </button>
      {blockedReason && (
        <p className="mt-2 text-[12.5px] text-warn">
          {blockedReason} <a href="/settings/billing" className="text-accent hover:text-accent-hover">See plans</a>
        </p>
      )}
      {inApp && (
        <p className="mt-2 text-[12px] text-faint">
          Using the Sendkar app and the connect window does not open?{" "}
          <a href="intent://www.sendkar.shop/settings/channels#Intent;scheme=https;package=com.android.chrome;end" className="text-accent hover:text-accent-hover">Open this page in Chrome</a>, connect there, then come back.
        </p>
      )}
      {status?.error && <p className="mt-2 text-[12.5px] text-danger">{status.error}</p>}
      {status?.success && (
        <p className="mt-2 text-[12.5px] text-accent">
          {status.coexistence
            ? "Connected — your app keeps working. Recent chats and contacts will appear in the inbox over the next few minutes."
            : "Connected — refresh to see it below."}
        </p>
      )}
      {status?.syncWarning && (
        <p className="mt-1 text-[12px] text-warn">
          Connected, but Meta didn&apos;t accept the request to bring your existing chats across: {status.syncWarning}.
          Meta only allows that within 24 hours of connecting, so reconnect the number if you want them.
        </p>
      )}
    </div>
  );
}
