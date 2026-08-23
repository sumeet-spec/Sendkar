"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export async function saveInstagramCreds(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const limits = getPlanLimits(workspace.plan);
  if (!limits.instagramEnabled) return { error: "Instagram is on the Growth plan and above — upgrade in Billing first." };

  const pageId = String(formData.get("pageId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ instagram_page_id: pageId || null, instagram_access_token: accessToken || null })
    .eq("id", workspace.id);

  if (error) return { error: error.message };
  revalidatePath("/settings/channels");
  return { success: true };
}

export async function saveWhatsAppCredsFromChannels(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const wabaId = String(formData.get("wabaId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      whatsapp_phone_number_id: phoneNumberId || null,
      whatsapp_waba_id: wabaId || null,
      whatsapp_access_token: accessToken || null,
    })
    .eq("id", workspace.id);

  if (error) return { error: error.message };
  revalidatePath("/settings/channels");
  return { success: true };
}
