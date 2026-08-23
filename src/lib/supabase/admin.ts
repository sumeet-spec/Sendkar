import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only for server-only code with no
 * user session to key policies off (the webhook route, the cron sender).
 * Never import this from a Client Component or expose it to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
