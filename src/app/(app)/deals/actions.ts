"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import type { DealStage } from "./constants";

export async function createDeal(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const title = String(formData.get("title") ?? "").trim();
  const value = Number(formData.get("value") ?? 0);
  const contactId = String(formData.get("contactId") ?? "").trim() || null;
  if (!title) return { error: "Give the deal a name." };

  const supabase = await createClient();
  const { error } = await supabase.from("deals").insert({
    workspace_id: workspace.id,
    title,
    value: Number.isFinite(value) ? value : 0,
    contact_id: contactId,
  });
  if (error) return { error: error.message };

  revalidatePath("/deals");
  return { success: true };
}

export async function moveDealStage(dealId: string, stage: DealStage) {
  const supabase = await createClient();
  await supabase.from("deals").update({ stage, updated_at: new Date().toISOString() }).eq("id", dealId);
  revalidatePath("/deals");
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient();
  await supabase.from("deals").delete().eq("id", dealId);
  revalidatePath("/deals");
}
