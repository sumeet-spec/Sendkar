import * as Sentry from "@sentry/nextjs";

// No-ops until NEXT_PUBLIC_SENTRY_DSN is set — safe to ship ahead of having
// a real Sentry project, same pattern as the Meta Embedded Signup env gate.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
