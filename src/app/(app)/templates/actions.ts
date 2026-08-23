"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { submitTemplateToMeta } from "@/lib/whatsapp";
import { generateTemplateDraft, type GeneratedTemplateDraft } from "@/lib/ai";
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
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const footerText = String(formData.get("footerText") ?? "").trim() || undefined;
  const quickReplies = String(formData.get("quickReplies") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3); // Meta caps quick-reply buttons at 3

  if (!name || !language || !metaTemplateName || !bodyText) {
    return { error: "Name, language, the Meta template name, and body text are all required." };
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
        components: { headerType, headerText, bodyText, footerText, buttons },
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
    body_text: bodyText,
    body_preview: bodyText,
    footer_text: footerText ?? null,
    buttons: buttons ?? null,
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

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("templates").delete().eq("id", templateId);
  revalidatePath("/templates");
}
