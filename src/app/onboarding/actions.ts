"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { verifyPhoneNumberCreds, subscribeAppToWaba } from "@/lib/whatsapp";
import { redirect } from "next/navigation";

export interface OnboardingResult {
  error?: string;
  success?: boolean;
  warning?: string;
  verifiedName?: string;
}

export async function saveWhatsAppCreds(_prevState: unknown, formData: FormData): Promise<OnboardingResult> {
  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const wabaId = String(formData.get("wabaId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  if (!phoneNumberId || !wabaId || !accessToken) {
    return { error: "All three fields are required to verify the connection." };
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found for this account." };

  // Verify BEFORE saving — entering a typo'd token used to save silently and
  // only surface as a failure the next time a real campaign tried to send.
  let verifiedName: string | null;
  try {
    const info = await verifyPhoneNumberCreds(phoneNumberId, accessToken);
    verifiedName = info.verifiedName;
  } catch (err) {
    return { error: `Meta rejected these credentials: ${err instanceof Error ? err.message : "unknown error"}. Double-check the phone number ID and access token from Meta Business Manager.` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ whatsapp_phone_number_id: phoneNumberId, whatsapp_waba_id: wabaId, whatsapp_access_token: accessToken })
    .eq("id", workspace.id);
  if (error) return { error: error.message };

  // Sending works the moment the fields above are valid — but nothing
  // delivers inbound messages or delivery-status webhooks to Sendkar until
  // the WABA is explicitly subscribed to Sendkar's app. A failure here
  // doesn't undo the save (sending still works); it's a warning, not a
  // blocking error.
  try {
    await subscribeAppToWaba(wabaId, accessToken);
  } catch (err) {
    return {
      success: true,
      verifiedName: verifiedName ?? undefined,
      warning: `Connected for sending, but webhook subscription failed: ${err instanceof Error ? err.message : "unknown error"}. You may not receive inbound replies or delivery statuses until this is resolved — check that your access token has the whatsapp_business_management permission.`,
    };
  }

  return { success: true, verifiedName: verifiedName ?? undefined };
}

export async function skipOnboarding() {
  redirect("/dashboard");
}
