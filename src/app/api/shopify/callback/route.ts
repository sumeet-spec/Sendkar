import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOAuthCallbackHmac, verifyState, exchangeCodeForToken, registerWebhook } from "@/lib/shopify";

/**
 * Shopify redirects here after the merchant approves the install. No
 * Supabase session is relied on — the workspace id travels in the signed
 * `state` param from buildInstallUrl, since a merchant bouncing through
 * Shopify's domain and back isn't guaranteed to keep an active session in
 * every browser/redirect-chain configuration.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) return NextResponse.json({ error: "Shopify integration isn't configured." }, { status: 500 });
  if (!shop || !code || !state) return NextResponse.json({ error: "Missing OAuth parameters." }, { status: 400 });

  if (!verifyOAuthCallbackHmac(searchParams, apiSecret)) {
    return NextResponse.json({ error: "Invalid HMAC — this request didn't come from Shopify." }, { status: 401 });
  }
  const stateResult = verifyState(state, apiSecret);
  if (!stateResult) return NextResponse.json({ error: "Invalid or expired state." }, { status: 401 });

  let accessToken: string;
  try {
    accessToken = await exchangeCodeForToken(shop, code);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Token exchange failed." }, { status: 502 });
  }

  const admin = createAdminClient();
  await admin
    .from("workspaces")
    .update({ shopify_shop_domain: shop, shopify_access_token: accessToken })
    .eq("id", stateResult.workspaceId);

  try {
    await registerWebhook(shop, accessToken, "orders/create", `${appUrl}/api/shopify/webhook`);
  } catch {
    // The store connection itself succeeded even if webhook registration didn't —
    // surfaced as "connected, but no auto-send yet" on the settings page, not a hard failure here.
  }
  try {
    // Powers abandoned-cart recovery: checkouts/update fires on every change to
    // an in-progress checkout (not just creation), which is what actually lets
    // Sendkar catch the cart's final state before it goes cold.
    await registerWebhook(shop, accessToken, "checkouts/update", `${appUrl}/api/shopify/webhook`);
  } catch {
    // Same posture as the order webhook above — non-fatal to the connection itself.
  }

  return NextResponse.redirect(`${appUrl}/settings/channels?shopify=connected`);
}
