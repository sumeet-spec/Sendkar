"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "sk_cookie_ack";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // A one-time localStorage read to decide first-visit visibility — there's
    // no external-system subscription to model here, just a value that
    // doesn't exist until the client mounts (SSR has no localStorage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 border-t border-border bg-surface/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-between sm:px-6">
      <p className="text-[12.5px] text-muted">
        Sendkar uses cookies to keep you signed in and basic analytics to understand how visitors use this site — no
        ads, no cross-site ad tracking. See our{" "}
        <Link href="/privacy" className="text-accent hover:text-accent-hover">Privacy Policy</Link>.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setVisible(false);
        }}
        className="sk-btn sk-btn-primary shrink-0 px-4 py-2 text-[13px]"
      >
        Got it
      </button>
    </div>
  );
}
