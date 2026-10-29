import type { createAdminClient } from "@/lib/supabase/admin";
import { workspaceCanSend } from "@/lib/plans";

type Admin = ReturnType<typeof createAdminClient>;

/** What a person sees when something is refused because the workspace has no active plan. */
export const NO_PLAN_MESSAGE = "Your free trial has ended. Choose a plan in Billing to keep sending messages.";

// The webhook asks this for every automated reply, and one customer message can trigger several, so the
// answer is remembered briefly instead of re-reading the workspace each time. A plan change takes at most
// this long to be noticed by automated replies.
const CACHE_MS = 30_000;
const cache = new Map<string, { ok: boolean; until: number }>();

/**
 * Whether a workspace may send right now, looked up by id (for code that only has the id).
 *
 * Fails OPEN when the workspace can't be read: a database hiccup must never silence a paying
 * customer's automations. The cost of being wrong that way is one reply that should not have gone out.
 */
export async function workspaceCanSendById(admin: Admin, workspaceId: string): Promise<boolean> {
  const hit = cache.get(workspaceId);
  if (hit && hit.until > Date.now()) return hit.ok;

  const { data, error } = await admin.from("workspaces").select("plan, trial_ends_at").eq("id", workspaceId).maybeSingle();
  if (error || !data) return true;

  const ok = workspaceCanSend(data);
  if (cache.size > 500) cache.clear();
  cache.set(workspaceId, { ok, until: Date.now() + CACHE_MS });
  return ok;
}
