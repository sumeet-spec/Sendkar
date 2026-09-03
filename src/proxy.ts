import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login", "/signup", "/invite",
  "/api/whatsapp/webhook", "/api/instagram/webhook", "/api/billing/webhook", "/api/cron",
  "/api/mcp", "/mcp",
  "/privacy", "/terms", "/support", "/changelog",
  "/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/.well-known",
  "/api/shopify/callback", "/api/shopify/webhook",
  "/api/woocommerce/webhook",
  "/api/v1/send",
  "/pay", "/api/payu/return",
];

// Short-lived cache so a burst of navigations/prefetches from one browser
// session (every sidebar click fires one, plus Next prefetches neighboring
// links) doesn't each pay for a fresh auth check. Keyed by the Supabase auth
// cookie(s) so it naturally invalidates on login/logout/token refresh. This
// is per-Edge-isolate memory, not a shared cache — a miss just falls through
// to a normal check below, so it can never make the gate less correct, only
// sometimes skip redundant work.
const AUTH_CACHE_TTL_MS = 20_000;
const authCache = new Map<string, { authed: boolean; expiresAt: number }>();

function readAuthCache(key: string): boolean | undefined {
  const entry = authCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    authCache.delete(key);
    return undefined;
  }
  return entry.authed;
}

function writeAuthCache(key: string, authed: boolean) {
  // Bound the cache instead of letting it grow across every distinct session
  // a warm Edge isolate happens to see.
  if (authCache.size > 1000) authCache.clear();
  authCache.set(key, { authed, expiresAt: Date.now() + AUTH_CACHE_TTL_MS });
}

function getAuthCookieKey(request: NextRequest): string | null {
  const authCookies = request.cookies
    .getAll()
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (authCookies.length === 0) return null;
  return authCookies
    .map((c) => `${c.name}=${c.value}`)
    .sort()
    .join("&");
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Every request through this middleware used to wait on this call with no
  // timeout — during a real Supabase incident (elevated auth latency, seen
  // live on 2026-08-28) that turned "Supabase is slow" into "the entire site
  // 504s for every visitor". RLS still protects actual data at the DB layer
  // regardless of what happens here, so on timeout/error we fail open (let
  // the request through) rather than hang the whole response — worst case an
  // anonymous visitor briefly sees a page shell whose own data calls then get
  // correctly denied, instead of nothing loading at all.
  //
  // getClaims() (not getUser()): on a project using asymmetric JWT signing
  // keys this verifies the token locally against a cached JWKS lookup — no
  // network round trip per request — while remaining just as secure as
  // getUser(). If the project still signs with a symmetric secret, it
  // transparently falls back to an equivalent server call, so this is never
  // less correct than the getUser() check it replaces.
  const cacheKey = getAuthCookieKey(request);
  const cached = cacheKey ? readAuthCache(cacheKey) : undefined;
  let authed: boolean;

  if (cached !== undefined) {
    authed = cached;
  } else {
    try {
      const result = await Promise.race([
        supabase.auth.getClaims(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("auth check timed out")), 4000)),
      ]);
      authed = !result.error && !!result.data?.claims;
    } catch {
      return response;
    }
    if (cacheKey) writeAuthCache(cacheKey, authed);
  }

  // Exact match for "/" — the marketing landing page for logged-out visitors —
  // since a startsWith("/") entry in PUBLIC_PATHS would match every route.
  const isPublic = request.nextUrl.pathname === "/" || PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!authed && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)",
  ],
};
