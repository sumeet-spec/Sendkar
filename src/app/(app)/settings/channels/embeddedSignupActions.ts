"use server";

import { createClient } from "@/lib/supabase/server";
import { listWabaPhoneNumbers, requestSmbAppDataSync, subscribeAppToWaba, verifyPhoneNumberCreds } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";
import { COEXISTENCE_EVENT } from "@/lib/coexistence";

const GRAPH_API_VERSION = "v22.0";

export interface EmbeddedSignupResult {
  error?: string;
  success?: boolean;
  coexistence?: boolean;
  /** Set when connecting worked but asking Meta to sync contacts/history did not. */
  syncWarning?: string;
}

/**
 * Exchanges the Embedded Signup `code` (from FB.login's callback) for an
 * access token, then verifies + saves the number the popup reported.
 *
 * Two shapes of completion arrive here:
 *  - a new number: Meta reports waba_id AND phone_number_id;
 *  - a number already on the WhatsApp Business app (coexistence): Meta reports
 *    only waba_id, the number is looked up, and the one-time contacts and chat
 *    history sync must be requested within 24 hours — so it is done here, once.
 * Phone-number registration is deliberately never attempted: for a coexistence
 * number it is already registered, and Meta says to skip it.
 *
 * Follows Meta's documented flow but has not run against a real Meta App +
 * signup configuration: that needs NEXT_PUBLIC_META_APP_ID, META_APP_SECRET and
 * NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID set up in Meta Business Manager,
 * Tech Provider (or Solution Partner) status, and — for anyone other than the
 * app's own test users — Meta's App Review approval.
 */
export async function completeEmbeddedSignup(
  workspaceId: string,
  code: string,
  wabaId: string | null,
  phoneNumberId: string | null,
  event: string | null,
): Promise<EmbeddedSignupResult> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return { error: "Embedded Signup isn't configured on this server yet." };
  if (!wabaId) return { error: "Meta didn't report a WhatsApp Business Account — try again." };
  const coexistence = event === COEXISTENCE_EVENT;

  // The code expires 30 seconds after the popup returns, so this goes first.
  const tokenRes = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`,
    { signal: AbortSignal.timeout(15_000) },
  );
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: { message?: string } };
  if (!tokenRes.ok || !tokenJson.access_token) {
    return { error: tokenJson.error?.message ?? "Meta rejected the signup code." };
  }
  const accessToken = tokenJson.access_token;

  let numberId = phoneNumberId;
  if (!numberId) {
    try {
      const numbers = await listWabaPhoneNumbers(wabaId, accessToken);
      numberId = numbers[0]?.id ?? null;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't find the connected number." };
    }
    if (!numberId) return { error: "Meta connected the account but reported no phone number on it yet — try again in a minute." };
  }

  let phoneInfo;
  try {
    phoneInfo = await verifyPhoneNumberCreds(numberId, accessToken);
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
      whatsapp_phone_number_id: numberId,
      whatsapp_waba_id: wabaId,
      whatsapp_access_token: accessToken,
      whatsapp_display_number: phoneInfo.displayPhoneNumber,
    })
    .eq("id", workspaceId);
  if (error) return { error: error.message };

  if (!coexistence) {
    // A fresh API-only number: clear any coexistence flags left from an earlier connection.
    await supabase.from("workspaces").update({ whatsapp_coexistence: false, coexistence_sync_error: null }).eq("id", workspaceId);
    revalidatePath("/settings/channels");
    return { success: true, coexistence: false };
  }

  // Meta allows each sync once, within 24 hours of onboarding — request both now.
  const syncErrors: string[] = [];
  for (const syncType of ["smb_app_state_sync", "history"] as const) {
    try {
      await requestSmbAppDataSync(numberId, accessToken, syncType);
    } catch (err) {
      syncErrors.push(`${syncType === "history" ? "Chat history" : "Contacts"}: ${err instanceof Error ? err.message : "request failed"}`);
    }
  }
  const syncWarning = syncErrors.length ? syncErrors.join(" · ") : undefined;

  // Separate, best-effort write: these columns come from a later migration, and
  // being connected must not depend on whether it has been applied yet.
  await supabase
    .from("workspaces")
    .update({
      whatsapp_coexistence: true,
      coexistence_onboarded_at: new Date().toISOString(),
      coexistence_sync_requested_at: new Date().toISOString(),
      coexistence_sync_error: syncWarning ?? null,
      coexistence_history_progress: null,
    })
    .eq("id", workspaceId);

  revalidatePath("/settings/channels");
  return { success: true, coexistence: true, syncWarning };
}
