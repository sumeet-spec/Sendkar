"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { submitTemplateToMeta } from "@/lib/whatsapp";
import { generateTemplateDraft, type GeneratedTemplateDraft } from "@/lib/ai";
import { parseCarouselCards } from "@/lib/carouselCards";
import { revalidatePath } from "next/cache";

export async function generateTemplateWithAi(description: string, language: string): Promise<{ draft?: GeneratedTemplateDraft; error?: string }> {
  if (!description.trim()) return { error: "Describe what the message should say." };
  try {
    const draft = await generateTemplateDraft(description, language);
    return { draft };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI draft failed." };
  }
}

export async function createTemplate(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const templateGroup = String(formData.get("templateGroup") ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_") || null;
  const metaTemplateName = String(formData.get("metaTemplateName") ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const category = String(formData.get("category") ?? "MARKETING") as "MARKETING" | "UTILITY" | "AUTHENTICATION";
  const headerType = String(formData.get("headerType") ?? "none") as "none" | "text" | "image";
  const headerText = String(formData.get("headerText") ?? "").trim() || undefined;
  const headerImageUrl = String(formData.get("headerImageUrl") ?? "").trim() || null;
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const footerText = String(formData.get("footerText") ?? "").trim() || undefined;
  const quickReplies = String(formData.get("quickReplies") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3); // Meta caps quick-reply buttons at 3
  const isCarousel = formData.get("isCarousel") === "on";
  const carouselCards = isCarousel ? parseCarouselCards(String(formData.get("carouselCards") ?? "")) : [];

  if (!name || !language || !metaTemplateName || !bodyText) {
    return { error: "Name, language, the Meta template name, and body text are all required." };
  }
  if (isCarousel && (carouselCards.length < 2 || carouselCards.length > 10)) {
    return { error: "A carousel template needs between 2 and 10 valid card lines." };
  }

  const buttons = quickReplies.length > 0 ? quickReplies.map((text) => ({ type: "QUICK_REPLY" as const, text })) : undefined;

  const supabase = await createClient();
  const canSubmitToMeta = Boolean(workspace.whatsapp_waba_id && workspace.whatsapp_access_token);

  let status = "pending";
  let metaResponse: unknown = null;
  let submitError: string | null = null;

  if (canSubmitToMeta) {
    try {
      metaResponse = await submitTemplateToMeta({
        wabaId: workspace.whatsapp_waba_id!,
        token: workspace.whatsapp_access_token!,
        name: metaTemplateName,
        language,
        category,
        components: { headerType, headerText, bodyText, footerText, buttons, carouselCards: isCarousel ? carouselCards : undefined },
      });
    } catch (err) {
      // Save the draft locally anyway — a rejected/failed submission shouldn't lose the work,
      // just surface why so it can be fixed and resubmitted.
      submitError = err instanceof Error ? err.message : "Meta rejected the submission.";
      status = "rejected";
    }
  }

  const { error } = await supabase.from("templates").insert({
    workspace_id: workspace.id,
    name,
    language,
    meta_template_name: metaTemplateName,
    category,
    header_type: headerType,
    header_text: headerText ?? null,
    header_image_url: headerImageUrl,
    body_text: bodyText,
    body_preview: bodyText,
    footer_text: footerText ?? null,
    buttons: buttons ?? null,
    carousel_cards: isCarousel ? carouselCards : null,
    meta_response: metaResponse,
    rejection_reason: submitError,
    template_group: templateGroup,
    status,
  });

  if (error) return { error: error.message };
  revalidatePath("/templates");

  if (!canSubmitToMeta) {
    return { success: true, warning: "Saved as a draft — connect a WhatsApp Business Account in Settings to submit it to Meta for real review." };
  }
  if (submitError) return { error: `Saved, but Meta rejected the submission: ${submitError}` };
  return { success: true };
}

export async function duplicateTemplate(templateId: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return;
  const supabase = await createClient();
  const { data: t } = await supabase.from("templates").select("*").eq("id", templateId).maybeSingle();
  if (!t) return;
  await supabase.from("templates").insert({
    workspace_id: workspace.id,
    name: `Copy of ${t.name}`,
    language: t.language,
    meta_template_name: `${t.meta_template_name}_copy`,
    category: t.category,
    header_type: t.header_type,
    header_text: t.header_text,
    header_image_url: t.header_image_url,
    body_text: t.body_text,
    body_preview: t.body_preview,
    footer_text: t.footer_text,
    buttons: t.buttons,
    carousel_cards: t.carousel_cards,
    template_group: t.template_group,
    status: "pending",
  });
  revalidatePath("/templates");
}

export async function resubmitTemplate(templateId: string, newBodyText: string): Promise<{ error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace." };
  if (!newBodyText.trim()) return { error: "Body text is required." };

  const supabase = await createClient();
  const { data: t } = await supabase.from("templates").select("*").eq("id", templateId).eq("workspace_id", workspace.id).maybeSingle();
  if (!t) return { error: "Template not found." };

  const canSubmit = Boolean(workspace.whatsapp_waba_id && workspace.whatsapp_access_token);
  let status = "pending";
  let metaResponse: unknown = null;
  let submitError: string | null = null;

  if (canSubmit) {
    try {
      metaResponse = await submitTemplateToMeta({
        wabaId: workspace.whatsapp_waba_id!,
        token: workspace.whatsapp_access_token!,
        name: t.meta_template_name,
        language: t.language,
        category: t.category,
        components: {
          headerType: t.header_type ?? "none",
          headerText: t.header_text ?? undefined,
          bodyText: newBodyText,
          footerText: t.footer_text ?? undefined,
          buttons: t.buttons ?? undefined,
          carouselCards: t.carousel_cards ?? undefined,
        },
      });
    } catch (err) {
      submitError = err instanceof Error ? err.message : "Meta rejected the submission.";
      status = "rejected";
    }
  }

  await supabase.from("templates").update({
    body_text: newBodyText,
    body_preview: newBodyText,
    status,
    meta_response: metaResponse,
    rejection_reason: submitError,
  }).eq("id", templateId);

  revalidatePath("/templates");
  if (submitError) return { error: submitError };
  return {};
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("templates").delete().eq("id", templateId);
  revalidatePath("/templates");
}
