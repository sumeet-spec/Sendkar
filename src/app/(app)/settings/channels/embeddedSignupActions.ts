"use server";

import { createClient } from "@/lib/supabase/server";
import { subscribeAppToWaba, verifyPhoneNumberCreds } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

const GRAPH_API_VERSION = "v22.0";

/**
 * Exchanges the Embedded Signup `code` (from FB.login's callback) for an
 * access token, then verifies + saves the phone number the popup reported
 * via postMessage. Everything here follows Meta's documented Embedded
 * Signup flow, but it hasn't been exercised against a real Meta App +
 * signup config — that needs NEXT_PUBLIC_META_APP_ID, META_APP_SECRET, and
 * NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID actually set up in Meta
 * Business Manager, plus (for anyone other than the app's own test users)
 * Meta's App Review approval — an external, human process on their side.
 */
export async function completeEmbeddedSignup(
  workspaceId: string,
  code: string,
  wabaId: string | null,
  phoneNumberId: string | null,
): Promise<{ error?: string; success?: boolean }> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return { error: "Embedded Signup isn't configured on this server yet." };
  if (!wabaId || !phoneNumberId) return { error: "Meta didn't report a WhatsApp Business Account — try again." };

  const tokenRes = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`,
    { signal: AbortSignal.timeout(15_000) },
  );
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: { message?: string } };
  if (!tokenRes.ok || !tokenJson.access_token) {
    return { error: tokenJson.error?.message ?? "Meta rejected the signup code." };
  }
  const accessToken = tokenJson.access_token;

  let phoneInfo;
  try {
    phoneInfo = await verifyPhoneNumberCreds(phoneNumberId, accessToken);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not verify the connected number." };
  }

  try {
    await subscribeAppToWaba(wabaId, accessToken);
  } catch {
    // The connection itself is still good even if the webhook subscription call failed —
    // same non-fatal posture as the manual WhatsAppForm connect flow.
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      whatsapp_phone_number_id: phoneNumberId,
      whatsapp_waba_id: wabaId,
      whatsapp_access_token: accessToken,
      whatsapp_display_number: phoneInfo.displayPhoneNumber,
    })
    .eq("id", workspaceId);
  if (error) return { error: error.message };

  revalidatePath("/settings/channels");
  return { success: true };
}
