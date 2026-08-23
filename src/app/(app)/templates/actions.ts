"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function createTemplate(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const metaTemplateName = String(formData.get("metaTemplateName") ?? "").trim();
  const category = String(formData.get("category") ?? "MARKETING");
  const bodyPreview = String(formData.get("bodyPreview") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");

  if (!name || !language || !metaTemplateName) return { error: "Name, language, and the Meta template name are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("templates").insert({
    workspace_id: workspace.id,
    name,
    language,
    meta_template_name: metaTemplateName,
    category,
    body_preview: bodyPreview || null,
    status,
  });

  if (error) return { error: error.message };
  revalidatePath("/templates");
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("templates").delete().eq("id", templateId);
  revalidatePath("/templates");
}
