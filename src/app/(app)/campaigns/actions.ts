"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { resolveNumberCredentials } from "@/lib/whatsappNumbers";
import { applySegmentConditions, type SegmentCondition } from "@/lib/segments";
import { draftCampaignStrategy, type CampaignStrategyDraft } from "@/lib/ai";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function generateCampaignStrategy(goal: string): Promise<{ draft?: CampaignStrategyDraft; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  if (!goal.trim()) return { error: "Describe the campaign's goal." };

  const supabase = await createClient();
  const [{ data: tagRows }, { data: langRows }] = await Promise.all([
    supabase.from("contacts").select("tags").eq("workspace_id", workspace.id).not("tags", "eq", "{}"),
    supabase.from("contacts").select("language").eq("workspace_id", workspace.id).not("language", "is", null),
  ]);
  const availableTags = [...new Set((tagRows ?? []).flatMap((r) => (r.tags as string[]) ?? []))];
  const availableLanguages = [...new Set((langRows ?? []).map((r) => r.language as string))];

  try {
    const draft = await draftCampaignStrategy(goal, { availableTags, availableLanguages });
    return { draft };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI strategist failed." };
  }
}

export async function createCampaign(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  const templateId = String(formData.get("templateId") ?? "");
  const segmentTag = String(formData.get("segmentTag") ?? "").trim() || null;
  const segmentId = String(formData.get("segmentId") ?? "") || null;
  const whatsappNumberId = String(formData.get("whatsappNumberId") ?? "") || null;
  if (!name || !templateId) return { error: "Name and template are required." };

  const supabase = await createClient();
  // A grouped template makes the whole campaign multi-language: every contact
  // gets whichever group member matches their own language at send time,
  // instead of everyone getting this one template's language regardless.
  const { data: chosenTemplate } = await supabase.from("templates").select("template_group").eq("id", templateId).single();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: workspace.id,
      name,
      template_id: templateId,
      template_group: chosenTemplate?.template_group ?? null,
      segment_tag: segmentTag,
      segment_id: segmentId,
      whatsapp_number_id: whatsappNumberId,
      status: "draft",
    })
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
export async function startCampaign(campaignId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, workspace_id, template_id, status, segment_tag, segment_id, template_group, templates(language)")
    .eq("id", campaignId)
    .single();
  if (!campaign || campaign.status !== "draft") return { error: "Campaign not found or not a draft." };

  let query = supabase.from("contacts").select("id").eq("workspace_id", campaign.workspace_id).eq("opted_out", false); // marketing sends must respect opt-out, unlike replies/automations

  if (campaign.template_group) {
    // Multi-language: audience is every language this group actually has an
    // approved-or-pending template for, resolved per-contact at send time —
    // not narrowed to the one language of the template picked at creation.
    const { data: groupTemplates } = await supabase
      .from("templates")
      .select("language")
      .eq("workspace_id", campaign.workspace_id)
      .eq("template_group", campaign.template_group);
    const coveredLanguages = [...new Set((groupTemplates ?? []).map((t) => t.language))];
    query = query.in("language", coveredLanguages);
  } else {
    const language = (campaign.templates as { language?: string } | null)?.language;
    query = query.eq("language", language);
  }
  if (campaign.segment_tag) query = query.contains("tags", [campaign.segment_tag]);
  if (campaign.segment_id) {
    const { data: segment } = await supabase.from("segments").select("conditions").eq("id", campaign.segment_id).maybeSingle();
    if (segment?.conditions) query = applySegmentConditions(query, segment.conditions as SegmentCondition[]);
  }
  const { data: contacts } = await query;

  if (contacts && contacts.length > 0) {
    const { error: recipientsError } = await supabase.from("campaign_recipients").insert(
      contacts.map((c) => ({ campaign_id: campaign.id, contact_id: c.id, status: "queued" as const })),
    );
    // Surfaced instead of swallowed: a failed insert here used to leave the
    // campaign flipped to "sending" with zero real recipients — the cron
    // would then find nothing queued and silently mark it "completed".
    if (recipientsError) return { error: `Couldn't snapshot the audience: ${recipientsError.message}` };
  }

  await supabase
    .from("campaigns")
    .update({ status: "sending", started_at: new Date().toISOString() })
    .eq("id", campaign.id);

  revalidatePath(`/campaigns/${campaignId}`);
  return {};
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
    .select("id, whatsapp_number_id, templates(meta_template_name, language, body_text)")
    .eq("id", campaignId)
    .eq("workspace_id", workspace.id)
    .single();
  const template = campaign?.templates as { meta_template_name?: string; language?: string; body_text?: string } | null;
  if (!template?.meta_template_name) return { error: "Template not found." };

  const creds = await resolveNumberCredentials(workspace, campaign?.whatsapp_number_id ?? null);
  const placeholderCount = (template.body_text?.match(/\{\{\d+\}\}/g) ?? []).length;

  try {
    await sendTemplateMessage({
      workspace: creds,
      to: phone,
      templateName: template.meta_template_name,
      language: template.language ?? "en",
      bodyParams: placeholderCount > 0 ? Array.from({ length: placeholderCount }, () => "there") : undefined,
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
