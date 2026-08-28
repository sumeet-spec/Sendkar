import * as Sentry from "@sentry/nextjs";

// Next.js auto-loads this file client-side before hydration — no bundler
// plugin needed. sentry.client.config.ts (the older convention) was never
// actually imported by anything, so client-side errors were silently never
// reaching Sentry despite the DSN being set; this is the file Next.js 16
// actually runs.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
