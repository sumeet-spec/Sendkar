import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project — without it, Turbopack walks up
  // and finds an unrelated package-lock.json at the Windows user-profile
  // root and warns about treating that as the monorepo root.
  turbopack: {
    root: __dirname,
  },
  // Baseline hardening headers flagged by an external scan. Deliberately NOT
  // adding Content-Security-Policy here — Next.js's own hydration relies on
  // inline scripts, and this app also loads the Facebook SDK, Sentry, and
  // Supabase realtime; a CSP needs a nonce-based setup wired through
  // middleware and real per-page testing, not a value guessed under time
  // pressure that could silently break hydration on every page.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
