import { createClient } from "@/lib/supabase/server";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  whatsapp_phone_number_id: string | null;
  whatsapp_waba_id: string | null;
  whatsapp_access_token: string | null;
  instagram_page_id: string | null;
  instagram_access_token: string | null;
  messaging_tier: number;
  daily_send_count: number;
  daily_reset_at: string;
  plan: string;
  dodo_customer_id: string | null;
  created_at: string;
}

/**
 * The workspace the current logged-in user belongs to. v1 assumption: one
 * user, one workspace (Instastarz today) — the workspace_members table
 * already supports more than one membership per user, so multi-workspace
 * switching is a UI addition later, not a schema change.
 */
export async function getCurrentWorkspace(): Promise<Workspace | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", membership.workspace_id)
    .maybeSingle();

  return workspace as Workspace | null;
}
