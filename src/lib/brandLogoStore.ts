import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sniffImage } from "@/lib/brandKit";

export const MAX_LOGO_BYTES = 1024 * 1024;

/** The signed-in user, if they belong to `workspaceId`. */
export async function memberOf(workspaceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !workspaceId) return false;
  const { data } = await supabase.from("workspace_members").select("id").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
  return Boolean(data);
}

/** Stores a PNG/JPG/WebP as the workspace's logo and returns its public address; null if it isn't a usable picture. */
export async function storeLogo(workspaceId: string, bytes: Uint8Array): Promise<string | null> {
  const kind = sniffImage(bytes);
  if (!kind || bytes.length > MAX_LOGO_BYTES) return null;
  const admin = createAdminClient();
  const path = `${workspaceId}/logo-${Date.now()}.${kind.ext}`;
  const { error } = await admin.storage.from("brand-assets").upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (error) return null;
  const { data: { publicUrl } } = admin.storage.from("brand-assets").getPublicUrl(path);
  const { error: saveError } = await admin.from("brand_kits").upsert(
    { workspace_id: workspaceId, logo_url: publicUrl, updated_at: new Date().toISOString() },
    { onConflict: "workspace_id" },
  );
  return saveError ? null : publicUrl;
}
