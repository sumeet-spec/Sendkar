import type { SupabaseClient } from "@supabase/supabase-js";
import { effectivePlan, imageAllowance, monthStartIst, numberAllowance, type ImageAllowance, type NumberAllowance } from "@/lib/plans";

interface WorkspaceRef {
  id: string;
  plan: string;
  trial_ends_at?: string | null;
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
  return numberAllowance(effectivePlan(workspace), await countConnectedNumbers(supabase, workspace));
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

export interface ImageUsage {
  /** Images drawn from the monthly allowance this calendar month (India). */
  monthlyUsed: number;
  /** Extra images bought as packs, not yet used. */
  packBalance: number;
  /** Everything ever bought, and everything drawn from packs, before the balance is clamped at zero. */
  packPurchased: number;
  packUsed: number;
}

/**
 * Where a workspace stands on AI images, or null if it couldn't be read — callers
 * must treat null as "don't spend money", never as "nothing used".
 *
 * Every generated image is one row in ai_image_usage; from_pack marks the ones
 * paid for from a purchased pack rather than the monthly allowance. Pack balance
 * is everything ever bought minus every image drawn from packs.
 */
export async function getImageUsage(supabase: SupabaseClient, workspaceId: string, now: Date = new Date()): Promise<ImageUsage | null> {
  const monthly = await supabase
    .from("ai_image_usage")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("from_pack", false)
    .gte("created_at", monthStartIst(now).toISOString());
  const packUsed = await supabase
    .from("ai_image_usage")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("from_pack", true);
  const bought = await supabase.from("image_pack_purchases").select("images").eq("workspace_id", workspaceId);
  if (monthly.error || packUsed.error || bought.error) return null;

  const purchased = (bought.data ?? []).reduce((sum: number, row: { images: number }) => sum + row.images, 0);
  return {
    monthlyUsed: monthly.count ?? 0,
    packBalance: Math.max(purchased - (packUsed.count ?? 0), 0),
    packPurchased: purchased,
    packUsed: packUsed.count ?? 0,
  };
}

export async function getImageAllowance(supabase: SupabaseClient, workspace: { id: string; plan: string; trial_ends_at?: string | null }): Promise<ImageAllowance | null> {
  const usage = await getImageUsage(supabase, workspace.id);
  return usage === null ? null : imageAllowance(effectivePlan(workspace), usage.monthlyUsed, usage.packBalance);
}
