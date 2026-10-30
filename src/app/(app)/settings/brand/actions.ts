"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { cleanGstin, cleanNames, isHexColor } from "@/lib/brandKit";
import { msg } from "@/lib/i18n/msg";

export async function saveBrandKit(_prev: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: await msg("noWorkspace") };

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  if (!name) return { error: await msg("needShopName") };

  const primary = String(formData.get("primary_color") ?? "").trim();
  const accent = String(formData.get("accent_color") ?? "").trim();
  if (!isHexColor(primary) || !isHexColor(accent)) return { error: await msg("pickColours") };

  const names = cleanNames(Object.fromEntries(LANGUAGES.map((l) => [l.code, formData.get(`name_${l.code}`)])));

  const gstin = cleanGstin(String(formData.get("gstin") ?? ""));
  if (gstin === null) return { error: await msg("gstinBad") };

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
