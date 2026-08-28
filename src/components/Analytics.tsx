"use client";

import Script from "next/script";

/**
 * No-ops entirely until NEXT_PUBLIC_GA_MEASUREMENT_ID is set — same gate
 * pattern as Meta Embedded Signup and Sentry elsewhere in this codebase.
 * Keep this in sync with the "no ads, no third-party trackers" claim in
 * CookieNotice.tsx — that copy was true when nothing here existed; it stops
 * being true the moment a real measurement ID is configured.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
