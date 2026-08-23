"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { generateApiKey } from "@/lib/apiKeys";
import { revalidatePath } from "next/cache";

export async function createApiKey(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give this key a name so you know what's using it." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not logged in." };

  const { plaintext, prefix, hash } = generateApiKey();
  const { error } = await supabase.from("api_keys").insert({
    workspace_id: workspace.id,
    name,
    key_prefix: prefix,
    key_hash: hash,
    created_by: userData.user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/settings/api-keys");
  return { success: true, plaintext };
}

export async function revokeApiKey(keyId: string) {
  const supabase = await createClient();
  await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", keyId);
  revalidatePath("/settings/api-keys");
}
