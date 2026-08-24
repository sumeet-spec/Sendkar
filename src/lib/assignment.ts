import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Load-balanced auto-assignment: the next unassigned contact goes to
 * whichever workspace member currently has the fewest contacts assigned to
 * them — not a fixed round-robin order, which drifts unfair the moment one
 * agent goes on leave. Same "load balancer" behavior Interakt names at its
 * Advanced tier.
 */
export async function pickAssignee(admin: SupabaseClient, workspaceId: string): Promise<string | null> {
  const { data: members } = await admin.from("workspace_members").select("user_id").eq("workspace_id", workspaceId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  if (memberIds.length === 0) return null;

  const { data: assigned } = await admin
    .from("contacts")
    .select("assignee_id")
    .eq("workspace_id", workspaceId)
    .in("assignee_id", memberIds);

  const loadByMember = new Map<string, number>(memberIds.map((id) => [id, 0]));
  for (const row of assigned ?? []) {
    if (row.assignee_id) loadByMember.set(row.assignee_id, (loadByMember.get(row.assignee_id) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestLoad = Infinity;
  for (const id of memberIds) {
    const load = loadByMember.get(id) ?? 0;
    if (load < bestLoad) {
      bestLoad = load;
      best = id;
    }
  }
  return best;
}
