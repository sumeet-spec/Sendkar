"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export async function saveBusinessHours(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const enabled = formData.get("enabled") === "on";
  const timezone = String(formData.get("timezone") ?? "Asia/Kolkata").trim() || "Asia/Kolkata";
  const awayMessage = String(formData.get("awayMessage") ?? "").trim();
  if (!awayMessage) return { error: "The away message can't be empty." };

  const supabase = await createClient();

  const { error: wsError } = await supabase
    .from("workspaces")
    .update({ business_hours_enabled: enabled, business_hours_timezone: timezone, away_message: awayMessage })
    .eq("id", workspace.id);
  if (wsError) return { error: wsError.message };

  // Simplest correct write: clear and re-insert every enabled day's window
  // rather than diffing — this form submits the whole week at once, and a
  // workspace has at most 7 rows here, so there's no performance reason to
  // do anything cleverer.
  await supabase.from("business_hours").delete().eq("workspace_id", workspace.id);

  const rows: Array<{ workspace_id: string; day_of_week: number; opens_at: string; closes_at: string }> = [];
  DAY_KEYS.forEach((key, dayOfWeek) => {
    if (formData.get(`${key}_active`) !== "on") return;
    const opensAt = String(formData.get(`${key}_opens`) ?? "").trim();
    const closesAt = String(formData.get(`${key}_closes`) ?? "").trim();
    if (opensAt && closesAt) rows.push({ workspace_id: workspace.id, day_of_week: dayOfWeek, opens_at: opensAt, closes_at: closesAt });
  });

  if (rows.length > 0) {
    const { error: hoursError } = await supabase.from("business_hours").insert(rows);
    if (hoursError) return { error: hoursError.message };
  }

  revalidatePath("/settings/business-hours");
  return { success: true };
}
