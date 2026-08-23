"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function createCannedResponse(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const shortcut = String(formData.get("shortcut") ?? "").trim().toLowerCase().replace(/^\//, "");
  const body = String(formData.get("body") ?? "").trim();
  if (!shortcut || !body) return { error: "Both a shortcut and a reply body are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("canned_responses").insert({ workspace_id: workspace.id, shortcut, body });
  if (error) return { error: error.message };

  revalidatePath("/settings/canned-responses");
  return { success: true };
}

export async function deleteCannedResponse(id: string) {
  const supabase = await createClient();
  await supabase.from("canned_responses").delete().eq("id", id);
  revalidatePath("/settings/canned-responses");
}
