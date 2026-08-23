import type { SupabaseClient } from "@supabase/supabase-js";

/** How far back a campaign send still gets credit for a sale that follows it. */
const ATTRIBUTION_WINDOW_DAYS = 7;

/**
 * Last-touch attribution: the most recent campaign this contact was
 * actually sent (sent/delivered/read, not just queued) within the window
 * before the order. Returns null for organic orders — most orders, for a
 * workspace that isn't running campaigns constantly, and that's expected.
 */
export async function attributeOrder(
  supabase: SupabaseClient,
  contactId: string,
  orderDate: Date,
): Promise<string | null> {
  const since = new Date(orderDate);
  since.setDate(since.getDate() - ATTRIBUTION_WINDOW_DAYS);

  const { data } = await supabase
    .from("campaign_recipients")
    .select("campaign_id, sent_at")
    .eq("contact_id", contactId)
    .in("status", ["sent", "delivered", "read"])
    .gte("sent_at", since.toISOString())
    .lte("sent_at", orderDate.toISOString())
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.campaign_id ?? null;
}
