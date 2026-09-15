import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { cache } from "react";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Resolves the logged-in user exactly once PER REQUEST, memoized via
 * React's cache() — not just once per call site. Supabase's refresh
 * tokens are single-use: every layout.tsx AND its child page.tsx
 * independently call getCurrentWorkspace() today, each constructing its
 * own client and calling auth.getUser(). If the access token happens to be
 * expired, the first call's silent refresh consumes the refresh token
 * (server-side) but can't persist the new one back to cookies (Server
 * Components can't set cookies) — so the second call, reading the same
 * now-already-consumed refresh token, fails and gets no user back, even
 * though the session was perfectly valid a moment earlier. cache() ensures
 * every caller in the same render tree — layout, page, and anything else —
 * gets the exact same resolved result instead of each triggering its own
 * auth.getUser() call.
 */
const getAuthedClient = cache(async (): Promise<{ supabase: SupabaseServerClient; userId: string } | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { supabase, userId: data.user.id };
});

export const ACTIVE_WORKSPACE_COOKIE = "sk_active_workspace";

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
  hubspot_api_key: string | null;
  business_hours_enabled: boolean;
  business_hours_timezone: string;
  away_message: string;
  auto_assignment_enabled: boolean;
  calling_enabled: boolean;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
  payu_merchant_key: string | null;
  payu_salt: string | null;
  whatsapp_last_send_error: string | null;
  whatsapp_last_send_error_at: string | null;
  ai_agent_enabled: boolean;
  ai_agent_knowledge: string | null;
  currency: string;
  created_at: string;
}

/**
 * The workspace the current logged-in user is ACTIVELY viewing. A user can
 * belong to more than one workspace (agency mode — one login managing
 * several client accounts); which one is "current" is tracked by a cookie,
 * not assumed to be the only one. No cookie, or a cookie pointing at a
 * workspace this user no longer belongs to, falls back to their first
 * membership — the exact behavior this function had before agency mode
 * existed, so nothing about the single-workspace case changes.
 */
export const getCurrentWorkspace = cache(async (): Promise<Workspace | null> => {
  const resolved = await getAuthedClient();
  if (!resolved) return null;
  const { supabase, userId } = resolved;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  // One round trip for every membership (with its workspace row embedded)
  // instead of up to three sequential ones (an active-cookie lookup, a
  // fallback lookup only reached if that missed, then a separate workspace
  // fetch) — a user only ever belongs to a handful of workspaces (agency
  // mode caps it low), so fetching all of them and picking the right one in
  // JS is cheap, and this runs on every single page load in the app.
  // Measured directly against production (2026-09-15): ~1.4s for the old
  // sequential version vs ~170ms for this one, on the exact same account.
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", userId);
  if (!memberships || memberships.length === 0) return null;

  const active = activeId ? memberships.find((m) => m.workspace_id === activeId) : undefined;
  const chosen = active ?? memberships[0];
  return (chosen.workspaces as unknown as Workspace | null) ?? null;
});

export interface UserWorkspace {
  id: string;
  name: string;
  role: string;
}

/** Every workspace this user belongs to — powers the agency workspace switcher. */
export const listUserWorkspaces = cache(async (): Promise<UserWorkspace[]> => {
  const resolved = await getAuthedClient();
  if (!resolved) return [];
  const { supabase, userId } = resolved;

  const { data } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name)")
    .eq("user_id", userId);

  return (data ?? [])
    .map((row) => {
      const ws = row.workspaces as { id?: string; name?: string } | null;
      return ws?.id ? { id: ws.id, name: ws.name ?? "Untitled", role: row.role as string } : null;
    })
    .filter((w): w is UserWorkspace => w !== null);
});

/**
 * The logged-in user's id, going through the same cached auth resolution as
 * getCurrentWorkspace() — callers that already called getCurrentWorkspace()
 * earlier in the same action/request and separately need the user id
 * should use this instead of calling supabase.auth.getUser() again
 * directly, for the exact reason documented on getAuthedClient() above.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const resolved = await getAuthedClient();
  return resolved?.userId ?? null;
}

export interface WorkspaceMember {
  userId: string;
  email: string | null;
  role: string;
}

/**
 * Team members with a display identity for assignment UI. workspace_members
 * only stores user_id, so identity comes from auth.users via the admin
 * client — team sizes are plan-capped small (max 15 on Growth), so one
 * lookup per member is fine rather than needing a denormalized column.
 * Login is by WhatsApp number now, not a real email, so the "email" field
 * here is actually the WhatsApp number when available — that's what's
 * meaningful to show a teammate, never the synthetic @sendkar.internal
 * address auth uses under the hood.
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
      const whatsappNumber = data?.user?.user_metadata?.whatsapp_number as string | undefined;
      return { userId: m.user_id, role: m.role as string, email: whatsappNumber ? `+${whatsappNumber}` : (data?.user?.email ?? null) };
    }),
  );
}
