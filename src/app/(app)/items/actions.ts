"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/workspace";
import { sniffImage } from "@/lib/brandKit";

export interface ItemResult { error?: string; success?: boolean }

const MAX_PHOTO_BYTES = 1024 * 1024;

export async function addItem(_prev: unknown, formData: FormData): Promise<ItemResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!name) return { error: "Enter a name for the item." };
  const kind = formData.get("kind") === "service" ? "service" : "item";
  const priceRaw = String(formData.get("price") ?? "").replace(/,/g, "").trim();
  let price: number | null = null;
  if (priceRaw) {
    price = Number.parseFloat(priceRaw);
    if (!Number.isFinite(price) || price < 0 || price > 99_999_999) return { error: "Enter the price as a number, like 640." };
  }
  const unit = String(formData.get("unit") ?? "").trim().slice(0, 30) || null;
  const description = String(formData.get("description") ?? "").trim().slice(0, 200) || null;

  let imageUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const type = sniffImage(bytes);
    if (!type || bytes.length > MAX_PHOTO_BYTES) return { error: "The photo must be a PNG, JPG or WebP under 1 MB." };
    const admin = createAdminClient();
    const path = `${workspace.id}/${Date.now()}.${type.ext}`;
    const { error } = await admin.storage.from("shop-items").upload(path, bytes, { contentType: type.mime });
    if (error) return { error: "Could not save the photo. Try again." };
    imageUrl = admin.storage.from("shop-items").getPublicUrl(path).data.publicUrl;
  }

  const supabase = await createClient();
  const { count } = await supabase.from("shop_items").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id);
  if ((count ?? 0) >= 500) return { error: "That is the most items a shop can list." };
  const { error } = await supabase.from("shop_items").insert({
    workspace_id: workspace.id, kind, name, price, unit, description, image_url: imageUrl, sort_order: (count ?? 0) + 1,
  });
  if (error) return { error: "Could not save the item. Try again." };
  revalidatePath("/items");
  return { success: true };
}

export async function toggleItem(id: string, active: boolean): Promise<void> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.from("shop_items").update({ is_active: active }).eq("id", id).eq("workspace_id", workspace.id);
  revalidatePath("/items");
}

export async function removeItem(id: string): Promise<void> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.from("shop_items").delete().eq("id", id).eq("workspace_id", workspace.id);
  revalidatePath("/items");
}
