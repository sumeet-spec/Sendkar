"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/workspace";
import { newJoinCode } from "@/lib/joinCode";
import { revalidatePath } from "next/cache";

export async function createJoinLink(): Promise<{ error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };
  // Confirm membership with the user's own session before using the service role.
  const supabase = await createClient();
  const { data: member } = await supabase.from("workspaces").select("id, join_code").eq("id", workspace.id).maybeSingle();
  if (!member) return { error: "No workspace found." };
  if (member.join_code) return {};

  const admin = createAdminClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await admin.from("workspaces").update({ join_code: newJoinCode() }).eq("id", workspace.id).is("join_code", null);
    if (!error) { revalidatePath("/settings/join"); return {}; }
  }
  return { error: "Could not create the link. Please try again." };
}
