import { createAdminClient } from "@/lib/supabase/admin";
import type { WorkspaceCreds } from "@/lib/whatsapp";

export interface WhatsAppNumberRow {
  id: string;
  workspace_id: string;
  label: string;
  phone_number_id: string;
  whatsapp_waba_id: string | null;
  access_token: string;
  display_number: string | null;
  messaging_tier: number;
  daily_send_count: number;
  daily_reset_at: string;
}

/**
 * Resolves which number's credentials to send from: a pinned
 * whatsapp_numbers row if numberId is given, otherwise the workspace's own
 * default fields — the fallback that keeps every workspace that never
 * added a second number behaving exactly as before this feature existed.
 */
export async function resolveNumberCredentials(
  workspace: WorkspaceCreds & { id: string },
  numberId: string | null | undefined,
): Promise<WorkspaceCreds> {
  if (!numberId) return workspace;
  const admin = createAdminClient();
  const { data: number } = await admin
    .from("whatsapp_numbers")
    .select("phone_number_id, access_token")
    .eq("id", numberId)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!number) return workspace; // pinned number was deleted — fall back rather than fail the send
  return { whatsapp_phone_number_id: number.phone_number_id, whatsapp_access_token: number.access_token };
}
