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
];

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
  let user: { id: string } | null = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("auth check timed out")), 4000)),
    ]);
    user = result.data.user;
  } catch {
    return response;
  }

  // Exact match for "/" — the marketing landing page for logged-out visitors —
  // since a startsWith("/") entry in PUBLIC_PATHS would match every route.
  const isPublic = request.nextUrl.pathname === "/" || PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!user && !isPublic) {
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
