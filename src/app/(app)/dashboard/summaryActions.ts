"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

/** The owner's own on/off switch for the morning WhatsApp summary. */
export async function setDailySummary(on: boolean): Promise<void> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.from("workspaces").update({ daily_summary: on }).eq("id", workspace.id);
}
