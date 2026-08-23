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

export async function saveMessengerCreds(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const limits = getPlanLimits(workspace.plan);
  if (!limits.instagramEnabled) return { error: "Messenger is on the Growth plan and above — upgrade in Billing first." };

  const pageId = String(formData.get("pageId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ messenger_page_id: pageId || null, messenger_access_token: accessToken || null })
    .eq("id", workspace.id);

  if (error) return { error: error.message };
  revalidatePath("/settings/channels");
  return { success: true };
}

export async function addWhatsAppNumber(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const label = String(formData.get("label") ?? "").trim();
  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const wabaId = String(formData.get("wabaId") ?? "").trim() || null;
  const displayNumber = String(formData.get("displayNumber") ?? "").replace(/[^\d]/g, "") || null;
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  if (!label || !phoneNumberId || !accessToken) return { error: "Label, phone number ID, and access token are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("whatsapp_numbers").insert({
    workspace_id: workspace.id,
    label,
    phone_number_id: phoneNumberId,
    whatsapp_waba_id: wabaId,
    display_number: displayNumber,
    access_token: accessToken,
  });
  if (error) return { error: error.message.includes("unique") ? "That phone number ID is already registered." : error.message };

  revalidatePath("/settings/channels");
  return { success: true };
}

export async function deleteWhatsAppNumber(id: string) {
  const supabase = await createClient();
  await supabase.from("whatsapp_numbers").delete().eq("id", id);
  revalidatePath("/settings/channels");
}

export async function saveWhatsAppCredsFromChannels(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const wabaId = String(formData.get("wabaId") ?? "").trim();
  const displayNumber = String(formData.get("displayNumber") ?? "").replace(/[^\d]/g, "");
  const catalogId = String(formData.get("catalogId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      whatsapp_phone_number_id: phoneNumberId || null,
      whatsapp_waba_id: wabaId || null,
      whatsapp_display_number: displayNumber || null,
      catalog_id: catalogId || null,
      whatsapp_access_token: accessToken || null,
    })
    .eq("id", workspace.id);

  if (error) return { error: error.message };
  revalidatePath("/settings/channels");
  return { success: true };
}
