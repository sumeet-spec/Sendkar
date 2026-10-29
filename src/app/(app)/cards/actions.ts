"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Removes a saved card from "My cards". The picture itself stays wherever it was already sent. */
export async function deleteSavedCard(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("saved_cards").delete().eq("id", id);
  revalidatePath("/cards");
}
