"use client";

import { useEffect, useState } from "react";
import { completeEmbeddedSignup } from "./embeddedSignupActions";

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
 * Meta's Embedded Signup — a self-serve alternative to the manual
 * phone-number-id + access-token form below, so a non-technical business
 * owner never has to open Meta Business Manager or copy a token by hand.
 *
 * Needs a real Meta App (NEXT_PUBLIC_META_APP_ID) with a WhatsApp Embedded
 * Signup configuration (META_EMBEDDED_SIGNUP_CONFIG_ID) set up in Meta
 * Business Manager, and — to work for anyone other than the app's own test
 * users — Meta App Review approval for whatsapp_business_management and
 * whatsapp_business_messaging. That review is an external, asynchronous
 * process on Meta's side; this component is what runs once it's approved,
 * not a way around needing it. Renders nothing if the env vars aren't set.
 */
export function EmbeddedSignupButton({ workspaceId }: { workspaceId: string }) {
  const configured = Boolean(process.env.NEXT_PUBLIC_META_APP_ID && process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID);
  const [sdkReady, setSdkReady] = useState(() => typeof window !== "undefined" && Boolean(window.FB));
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const [signupData, setSignupData] = useState<{ wabaId: string | null; phoneNumberId: string | null }>({ wabaId: null, phoneNumberId: null });

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
      if (event.origin !== "https://www.facebook.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          setSignupData({ wabaId: data.data?.waba_id ?? null, phoneNumberId: data.data?.phone_number_id ?? null });
        }
      } catch {
        // Not every message on the page is Meta's signup payload — ignore anything that isn't valid JSON for us.
      }
    };
    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, [configured]);

  if (!configured) return null;

  function handleLogin() {
    if (!window.FB) return;
    setPending(true);
    setStatus(null);
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
        completeEmbeddedSignup(workspaceId, code, signupData.wabaId, signupData.phoneNumberId).then((result) => {
          setStatus(result);
          setPending(false);
        });
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, sessionInfoVersion: "3" },
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
      <p className="mb-3 rounded-md border border-warn/30 bg-warn/5 p-2.5 text-[12px] text-foreground">
        Use a number you don&apos;t already use in the regular WhatsApp app — connecting it here moves it to Sendkar
        and logs it out of the app. Your chats stay on your phone, but you&apos;ll manage this number from Sendkar
        going forward.
      </p>
      <button
        onClick={handleLogin}
        disabled={!sdkReady || pending}
        className="sk-btn sk-btn-primary disabled:opacity-60"
      >
        {pending ? "Connecting…" : sdkReady ? "Continue with Facebook" : "Loading…"}
      </button>
      {status?.error && <p className="mt-2 text-[12.5px] text-danger">{status.error}</p>}
      {status?.success && <p className="mt-2 text-[12.5px] text-accent">Connected — refresh to see it below.</p>}
    </div>
  );
}
