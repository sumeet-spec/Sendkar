"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { parseBranches } from "@/lib/flowBranching";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createFlow(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  // Flows reuse the automations plan gate — both are "reply logic beyond the free tier".
  const limits = getPlanLimits(workspace.plan);
  if (!limits.automationsEnabled) return { error: "Chatbot flows need the Starter plan or above." };

  const name = String(formData.get("name") ?? "").trim();
  const triggerKeyword = String(formData.get("triggerKeyword") ?? "").trim().toLowerCase();
  const matchType = String(formData.get("matchType") ?? "contains");
  if (!name || !triggerKeyword) return { error: "Name and trigger keyword are required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flows")
    .insert({ workspace_id: workspace.id, name, trigger_keyword: triggerKeyword, match_type: matchType })
    .select("id")
    .single();
  if (error) return { error: error.message };

  redirect(`/flows/${data.id}`);
}

export async function toggleFlow(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("flows").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/flows");
}

export async function deleteFlow(id: string) {
  const supabase = await createClient();
  await supabase.from("flows").delete().eq("id", id);
  revalidatePath("/flows");
}

export async function addFlowStep(_prevState: unknown, formData: FormData) {
  const flowId = String(formData.get("flowId") ?? "");
  const messageBody = String(formData.get("messageBody") ?? "").trim();
  const branchesRaw = String(formData.get("branches") ?? "");
  const defaultNextStr = String(formData.get("defaultNextStepOrder") ?? "").trim();
  const messageType = String(formData.get("messageType") ?? "text");
  const captureVariable = String(formData.get("captureVariable") ?? "").trim().toLowerCase() || null;
  if (!flowId || !messageBody) return { error: "A message body is required." };

  let interactivePayload: { buttons: Array<{ id: string; title: string }> } | null = null;
  if (messageType === "buttons") {
    const buttons = [1, 2, 3]
      .map((i) => String(formData.get(`buttonLabel${i}`) ?? "").trim())
      .filter(Boolean)
      .map((title, i) => ({ id: `btn_${i + 1}`, title }));
    if (buttons.length === 0) return { error: "A buttons step needs at least one button label." };
    interactivePayload = { buttons };
  }

  const supabase = await createClient();
  const { data: existingSteps } = await supabase.from("flow_steps").select("step_order").eq("flow_id", flowId).order("step_order", { ascending: false }).limit(1);
  const nextOrder = (existingSteps?.[0]?.step_order ?? 0) + 1;

  const { error } = await supabase.from("flow_steps").insert({
    flow_id: flowId,
    step_order: nextOrder,
    message_body: messageBody,
    branches: parseBranches(branchesRaw),
    default_next_step_order: defaultNextStr ? Number(defaultNextStr) : null,
    message_type: messageType,
    interactive_payload: interactivePayload,
    capture_variable: captureVariable,
  });
  if (error) return { error: error.message };

  revalidatePath(`/flows/${flowId}`);
  return { success: true };
}

export async function deleteFlowStep(stepId: string, flowId: string) {
  const supabase = await createClient();
  await supabase.from("flow_steps").delete().eq("id", stepId);
  revalidatePath(`/flows/${flowId}`);
}
