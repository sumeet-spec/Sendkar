"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCampaign(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("templateId") ?? "");
  if (!name || !templateId) return { error: "Name and template are required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ workspace_id: workspace.id, name, template_id: templateId, status: "draft" })
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
    .select("id, workspace_id, template_id, status, templates(language)")
    .eq("id", campaignId)
    .single();
  if (!campaign || campaign.status !== "draft") return;

  const language = (campaign.templates as { language?: string } | null)?.language;
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id")
    .eq("workspace_id", campaign.workspace_id)
    .eq("language", language);

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
