"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function createProduct(_prevState: unknown, formData: FormData) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found." };

  const retailerId = String(formData.get("retailerId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!retailerId || !name) return { error: "Retailer ID and name are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    workspace_id: workspace.id,
    retailer_id: retailerId,
    name,
    price_label: priceLabel,
    image_url: imageUrl,
    description,
  });
  if (error) return { error: error.message.includes("unique") ? "A product with that retailer ID already exists." : error.message };

  revalidatePath("/catalog");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/catalog");
}
