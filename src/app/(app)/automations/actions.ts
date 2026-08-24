"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { suggestAutomationsFromHistory, type AutomationSuggestion } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function getAutomationSuggestions(): Promise<{ suggestions?: AutomationSuggestion[]; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("body")
    .eq("workspace_id", workspace.id)
    .eq("direction", "inbound")
    .order("created_at", { ascending: false })
    .limit(300);

  const bodies = (messages ?? []).map((m) => m.body).filter((b): b is string => Boolean(b));
  try {
    const suggestions = await suggestAutomationsFromHistory(bodies);
    return { suggestions };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't generate suggestions." };
  }
}

export async function createAutomationFromSuggestion(suggestion: AutomationSuggestion) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const supabase = await createClient();
  // Starts inactive, deliberately: the suggestion's reply body is compiled
  // from raw contact-message history by an AI that never distinguishes
  // customer text from instructions, so a crafted repeated message could
  // in principle steer what gets suggested. Requiring a second, explicit
  // toggle in the Automations list (where it sits next to every other rule)
  // means one inattentive click can't put a bad suggestion live immediately.
  const { error } = await supabase.from("automations").insert({
    workspace_id: workspace.id,
    name: suggestion.triggerKeyword,
    trigger_keyword: suggestion.triggerKeyword.toLowerCase(),
    match_type: suggestion.matchType,
    reply_body: suggestion.replyBody,
    is_active: false,
  });
  if (error) return { error: error.message };

  revalidatePath("/automations");
  return { success: true };
}

export async function createAutomation(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const limits = getPlanLimits(workspace.plan);
  if (!limits.automationsEnabled) return { error: "Automations need the Starter plan or above." };

  const name = String(formData.get("name") ?? "").trim();
  const triggerKeyword = String(formData.get("triggerKeyword") ?? "").trim().toLowerCase();
  const matchType = String(formData.get("matchType") ?? "contains");
  const replyBody = String(formData.get("replyBody") ?? "").trim();

  if (!name || !triggerKeyword || !replyBody) return { error: "All fields are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("automations").insert({
    workspace_id: workspace.id, name, trigger_keyword: triggerKeyword, match_type: matchType, reply_body: replyBody,
  });
  if (error) return { error: error.message };

  revalidatePath("/automations");
  return { success: true };
}

export async function toggleAutomation(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("automations").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/automations");
}

export async function deleteAutomation(id: string) {
  const supabase = await createClient();
  await supabase.from("automations").delete().eq("id", id);
  revalidatePath("/automations");
}
