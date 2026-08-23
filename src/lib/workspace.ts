import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  whatsapp_phone_number_id: string | null;
  whatsapp_waba_id: string | null;
  whatsapp_access_token: string | null;
  whatsapp_display_number: string | null;
  catalog_id: string | null;
  instagram_page_id: string | null;
  instagram_access_token: string | null;
  messenger_page_id: string | null;
  messenger_access_token: string | null;
  messaging_tier: number;
  daily_send_count: number;
  daily_reset_at: string;
  plan: string;
  dodo_customer_id: string | null;
  shopify_shop_domain: string | null;
  shopify_access_token: string | null;
  order_confirmation_template_id: string | null;
  woocommerce_store_url: string | null;
  woocommerce_webhook_secret: string | null;
  klaviyo_api_key: string | null;
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

export interface WorkspaceMember {
  userId: string;
  email: string | null;
  role: string;
}

/**
 * Team members with their emails for assignment UI. workspace_members only
 * stores user_id, so emails come from auth.users via the admin client —
 * team sizes are plan-capped small (max 10 on Growth), so one lookup per
 * member is fine rather than needing a denormalized email column.
 */
export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId);
  if (!members || members.length === 0) return [];

  const admin = createAdminClient();
  return Promise.all(
    members.map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      return { userId: m.user_id, role: m.role as string, email: data?.user?.email ?? null };
    }),
  );
}
