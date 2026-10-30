"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { cleanGstin, cleanNames, isHexColor } from "@/lib/brandKit";

export async function saveBrandKit(_prev: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) return { error: "Add your shop or business name first." };

  const primary = String(formData.get("primary_color") ?? "").trim();
  const accent = String(formData.get("accent_color") ?? "").trim();
  if (!isHexColor(primary) || !isHexColor(accent)) return { error: "Pick the colours again." };

  const names = cleanNames(Object.fromEntries(LANGUAGES.map((l) => [l.code, formData.get(`name_${l.code}`)])));

  const gstin = cleanGstin(String(formData.get("gstin") ?? ""));
  if (gstin === null) return { error: "That GSTIN does not look right. It has 15 letters and numbers, like 24ABCDE1234F1Z5. Leave it empty if you do not have one." };

  const supabase = await createClient();
  const { error } = await supabase.from("brand_kits").upsert({
    workspace_id: workspace.id,
    name,
    names,
    tagline: String(formData.get("tagline") ?? "").trim().slice(0, 60),
    primary_color: primary,
    accent_color: accent,
    phone: String(formData.get("phone") ?? "").trim().slice(0, 30),
    address: String(formData.get("address") ?? "").trim().slice(0, 80),
    website: String(formData.get("website") ?? "").trim().slice(0, 60),
    gstin,
    updated_at: new Date().toISOString(),
  }, { onConflict: "workspace_id" });
  if (error) return { error: error.message };

  revalidatePath("/settings/brand");
  revalidatePath("/cards");
  return { success: true };
}
