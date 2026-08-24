"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { requestCallPermission } from "@/lib/calling";
import { revalidatePath } from "next/cache";

export async function toggleCalling(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const enabled = formData.get("enabled") === "on";
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ calling_enabled: enabled }).eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/calling");
  return { success: true };
}

export async function sendCallPermissionRequest(contactPhone: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  try {
    await requestCallPermission(workspace, contactPhone);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not send the call permission request." };
  }
}
