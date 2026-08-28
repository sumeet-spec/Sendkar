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
    // No tracesSampleRate: performance tracing hooks browser Performance
    // APIs, and when an ad/tracker blocker (Brave Shields, uBlock, etc.)
    // blocks Sentry's ingest domain, that instrumentation throws an
    // UNCAUGHT error instead of failing silently — seen live blocking a
    // real user's page. Error reporting alone doesn't have this problem.
  });
}
