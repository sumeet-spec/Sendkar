"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export async function saveAiAgent(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const enabled = formData.get("enabled") === "on";
  if (enabled && !getPlanLimits(workspace.plan).aiAgentEnabled) {
    return { error: "The AI agent needs the Growth plan or above — every reply it sends is a real AI request." };
  }
  const knowledge = String(formData.get("knowledge") ?? "").trim();
  if (enabled && !knowledge) return { error: "Add at least a short business description before turning this on — the agent needs something to answer from." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ ai_agent_enabled: enabled, ai_agent_knowledge: knowledge || null })
    .eq("id", workspace.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/ai-agent");
  return { success: true };
}
