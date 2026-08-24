"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export async function createSequence(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const limits = getPlanLimits(workspace.plan);
  if (!limits.automationsEnabled) return { error: "Sequences need the Starter plan or above." };

  const name = String(formData.get("name") ?? "").trim();
  const triggerType = String(formData.get("triggerType") ?? "keyword");
  const triggerKeyword = String(formData.get("triggerKeyword") ?? "").trim().toLowerCase();
  const matchType = String(formData.get("matchType") ?? "contains");

  if (!name) return { error: "Name is required." };
  if (triggerType === "keyword" && !triggerKeyword) return { error: "A keyword trigger needs a keyword." };
  if (triggerType === "cart_abandoned" && !workspace.shopify_shop_domain) {
    return { error: "Connect Shopify first — cart_abandoned sequences enroll from real checkout events." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sequences")
    .insert({
      workspace_id: workspace.id,
      name,
      trigger_type: triggerType,
      trigger_keyword: triggerType === "keyword" ? triggerKeyword : null,
      match_type: matchType,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/sequences");
  return { success: true, id: data.id };
}

export async function toggleSequence(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("sequences").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/sequences");
}

export async function deleteSequence(id: string) {
  const supabase = await createClient();
  await supabase.from("sequences").delete().eq("id", id);
  revalidatePath("/sequences");
}

export async function addSequenceStep(_prevState: unknown, formData: FormData) {
  const sequenceId = String(formData.get("sequenceId") ?? "");
  const delayMinutes = Number(formData.get("delayMinutes") ?? 0);
  const messageBody = String(formData.get("messageBody") ?? "").trim();
  const includePaymentLink = formData.get("includePaymentLink") === "on";
  if (!sequenceId || !messageBody) return { error: "A message is required." };
  if (delayMinutes < 0) return { error: "Delay can't be negative." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("sequence_steps").select("step_order").eq("sequence_id", sequenceId).order("step_order", { ascending: false }).limit(1).maybeSingle();
  const nextOrder = (existing?.step_order ?? 0) + 1;

  const { error } = await supabase.from("sequence_steps").insert({
    sequence_id: sequenceId,
    step_order: nextOrder,
    delay_minutes: delayMinutes,
    message_body: messageBody,
    include_payment_link: includePaymentLink,
  });
  if (error) return { error: error.message };

  revalidatePath(`/sequences/${sequenceId}`);
  return { success: true };
}

export async function deleteSequenceStep(id: string, sequenceId: string) {
  const supabase = await createClient();
  await supabase.from("sequence_steps").delete().eq("id", id);
  revalidatePath(`/sequences/${sequenceId}`);
}
