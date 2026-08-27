import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// captureRequestError is a no-op internally until Sentry.init() has actually
// run somewhere — safe to wire up unconditionally even before a DSN exists.
export const onRequestError = Sentry.captureRequestError;
