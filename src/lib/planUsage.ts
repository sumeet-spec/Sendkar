import type { SupabaseClient } from "@supabase/supabase-js";
import { imageAllowance, monthStartIst, numberAllowance, type ImageAllowance, type NumberAllowance } from "@/lib/plans";

interface WorkspaceRef {
  id: string;
  plan: string;
  whatsapp_phone_number_id: string | null;
}

/** The default number plus any extra numbers added under Channels. */
export async function countConnectedNumbers(supabase: SupabaseClient, workspace: WorkspaceRef): Promise<number> {
  const { count } = await supabase
    .from("whatsapp_numbers")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);
  return (workspace.whatsapp_phone_number_id ? 1 : 0) + (count ?? 0);
}

export async function getNumberAllowance(supabase: SupabaseClient, workspace: WorkspaceRef): Promise<NumberAllowance> {
  return numberAllowance(workspace.plan, await countConnectedNumbers(supabase, workspace));
}

export type ConnectCheck = { ok: true } | { ok: false; error: string };

/**
 * Whether this workspace may connect a number right now. Swapping the default
 * number for another one changes nothing about the count, so it is always
 * allowed; adding a new one needs room on the plan. Numbers connected before
 * limits existed are left alone: this only stops NEW connections.
 */
export async function checkCanConnectNumber(
  supabase: SupabaseClient,
  workspace: WorkspaceRef,
  opts: { replacingDefault: boolean },
): Promise<ConnectCheck> {
  if (opts.replacingDefault && workspace.whatsapp_phone_number_id) return { ok: true };
  const allowance = await getNumberAllowance(supabase, workspace);
  return allowance.canAdd ? { ok: true } : { ok: false, error: allowance.blockedReason ?? "Your plan doesn't include another WhatsApp number." };
}

/** AI images generated this calendar month (India), or null if the count couldn't be read. */
export async function countImagesThisMonth(supabase: SupabaseClient, workspaceId: string, now: Date = new Date()): Promise<number | null> {
  const { count, error } = await supabase
    .from("ai_image_usage")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", monthStartIst(now).toISOString());
  return error ? null : (count ?? 0);
}

export async function getImageAllowance(supabase: SupabaseClient, workspace: { id: string; plan: string }): Promise<ImageAllowance | null> {
  const used = await countImagesThisMonth(supabase, workspace.id);
  return used === null ? null : imageAllowance(workspace.plan, used);
}
