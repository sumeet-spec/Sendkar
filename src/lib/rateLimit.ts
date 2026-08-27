import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

/**
 * Fixed-window rate limiting backed by Postgres (check_rate_limit() in
 * migration 0017) instead of Redis — nothing here runs often enough to need
 * a dedicated store, and this keeps every request atomic under concurrent
 * hits on the same key.
 */
export async function isRateLimited(key: string, maxAttempts: number, windowSeconds: number): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_max_attempts: maxAttempts,
    p_window_seconds: windowSeconds,
  });
  // Fails open: a broken rate-limit check shouldn't take down signup/login.
  if (error) return false;
  return Boolean(data);
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}
