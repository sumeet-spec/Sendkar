"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits, effectivePlan } from "@/lib/plans";
import { revalidatePath } from "next/cache";
import { msg } from "@/lib/i18n/msg";

export async function saveAiAgent(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };

  const enabled = formData.get("enabled") === "on";
  if (enabled && !getPlanLimits(effectivePlan(workspace)).aiAgentEnabled) {
    return { error: await msg("aiPlan") };
  }
  const knowledge = String(formData.get("knowledge") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ ai_agent_enabled: enabled, ai_agent_knowledge: knowledge || null })
    .eq("id", workspace.id);
  if (error) return { error: await msg("saveFail") };

  revalidatePath("/settings/ai-agent");
  return { success: true };
}
