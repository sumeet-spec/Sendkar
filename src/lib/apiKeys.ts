import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const KEY_PREFIX = "sk_live_";

/** Plaintext is shown to the user exactly once, at creation — only the hash is ever stored. */
export function generateApiKey(): { plaintext: string; prefix: string; hash: string } {
  const secret = crypto.randomBytes(24).toString("base64url");
  const plaintext = `${KEY_PREFIX}${secret}`;
  const prefix = plaintext.slice(0, KEY_PREFIX.length + 6);
  const hash = crypto.createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, prefix, hash };
}

export interface AuthenticatedWorkspace {
  workspaceId: string;
  apiKeyId: string;
}

/** Resolves a bearer token to its workspace — the MCP server's entire auth model. */
export async function resolveApiKey(bearerToken: string | null): Promise<AuthenticatedWorkspace | null> {
  if (!bearerToken || !bearerToken.startsWith(KEY_PREFIX)) return null;
  const hash = crypto.createHash("sha256").update(bearerToken).digest("hex");

  const admin = createAdminClient();
  const { data: key } = await admin
    .from("api_keys")
    .select("id, workspace_id, revoked_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (!key || key.revoked_at) return null;

  void admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);
  return { workspaceId: key.workspace_id, apiKeyId: key.id };
}
