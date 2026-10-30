"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import type { SegmentCondition, SegmentField } from "@/lib/segments";
import { revalidatePath } from "next/cache";
import { msg } from "@/lib/i18n/msg";

const VALID_FIELDS = new Set<SegmentField>(["tag", "auto_tag", "language", "source", "sentiment"]);

export async function createSegment(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: await msg("segName") };

  const fields = formData.getAll("field") as string[];
  const values = formData.getAll("value") as string[];
  const conditions: SegmentCondition[] = fields
    .map((field, i) => ({ field: field as SegmentField, value: (values[i] ?? "").trim() }))
    .filter((c) => VALID_FIELDS.has(c.field) && c.value.length > 0);
  if (conditions.length === 0) return { error: await msg("segCond") };

  const supabase = await createClient();
  const { error } = await supabase.from("segments").insert({ workspace_id: workspace.id, name, conditions });
  if (error) return { error: error.message };

  revalidatePath("/segments");
  return { success: true };
}

/** Same insert as createSegment, but takes conditions directly (from the AI strategist's draft) instead of parsing FormData rows. */
export async function createSegmentFromConditions(name: string, conditions: SegmentCondition[]): Promise<{ error?: string; id?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };
  if (!name.trim() || conditions.length === 0) return { error: await msg("segCond") };

  const supabase = await createClient();
  const { data, error } = await supabase.from("segments").insert({ workspace_id: workspace.id, name, conditions }).select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/segments");
  return { id: data.id };
}

export async function deleteSegment(id: string) {
  const supabase = await createClient();
  await supabase.from("segments").delete().eq("id", id);
  revalidatePath("/segments");
}
