"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCampaign(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("templateId") ?? "");
  const segmentTag = String(formData.get("segmentTag") ?? "").trim() || null;
  if (!name || !templateId) return { error: "Name and template are required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ workspace_id: workspace.id, name, template_id: templateId, segment_tag: segmentTag, status: "draft" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/campaigns/${data.id}`);
}

/**
 * Snapshots the recipient list at launch time (contacts matching the
 * template's language), rather than resolving it dynamically at send time —
 * a campaign's audience should be fixed the moment it launches, not shift
 * under it if contacts are imported mid-send.
 */
export async function startCampaign(campaignId: string) {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, workspace_id, template_id, status, segment_tag, templates(language)")
    .eq("id", campaignId)
    .single();
  if (!campaign || campaign.status !== "draft") return;

  const language = (campaign.templates as { language?: string } | null)?.language;
  let query = supabase
    .from("contacts")
    .select("id")
    .eq("workspace_id", campaign.workspace_id)
    .eq("language", language)
    .eq("opted_out", false); // marketing sends must respect opt-out, unlike replies/automations
  if (campaign.segment_tag) query = query.contains("tags", [campaign.segment_tag]);
  const { data: contacts } = await query;

  if (contacts && contacts.length > 0) {
    await supabase.from("campaign_recipients").insert(
      contacts.map((c) => ({ campaign_id: campaign.id, contact_id: c.id, status: "queued" as const })),
    );
  }

  await supabase
    .from("campaigns")
    .update({ status: "sending", started_at: new Date().toISOString() })
    .eq("id", campaign.id);

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function sendTestMessage(_prevState: unknown, formData: FormData) {
  const campaignId = String(formData.get("campaignId") ?? "");
  const phone = String(formData.get("phone") ?? "").replace(/[^\d]/g, "");
  if (!campaignId || phone.length < 10) return { error: "Enter a valid phone number, digits only with country code." };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, templates(meta_template_name, language, body_text)")
    .eq("id", campaignId)
    .eq("workspace_id", workspace.id)
    .single();
  const template = campaign?.templates as { meta_template_name?: string; language?: string; body_text?: string } | null;
  if (!template?.meta_template_name) return { error: "Template not found." };

  try {
    await sendTemplateMessage({
      workspace,
      to: phone,
      templateName: template.meta_template_name,
      language: template.language ?? "en",
      bodyParams: template.body_text?.includes("{{1}}") ? ["there"] : undefined,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Test send failed." };
  }

  return { success: true };
}

export async function pauseCampaign(campaignId: string) {
  const supabase = await createClient();
  await supabase.from("campaigns").update({ status: "paused" }).eq("id", campaignId);
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function resumeCampaign(campaignId: string) {
  const supabase = await createClient();
  await supabase.from("campaigns").update({ status: "sending" }).eq("id", campaignId);
  revalidatePath(`/campaigns/${campaignId}`);
}
